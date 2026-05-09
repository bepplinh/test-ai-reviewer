import { Request, Response, NextFunction } from 'express';
import { GithubWebhookDto } from '../github/github.types';
import { logger } from '../../shared/utils/logger';
import { prisma } from '../../prisma/client';
import { addReviewJob } from '../queue/review.queue';

const SUPPORTED_ACTIONS = ['opened', 'synchronize', 'reopened'];

/**
 * POST /api/webhooks/github
 * Receives GitHub webhook events, verifies idempotency, and enqueues PR review.
 */
export async function handleGithubWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const event = req.headers['x-github-event'] as string;
    const deliveryId = req.headers['x-github-delivery'] as string;

    logger.info({ event, deliveryId }, 'Webhook received');

    // Only process pull_request events
    if (event !== 'pull_request') {
      res.status(200).json({ success: true, message: 'Event ignored' });
      return;
    }

    // 1. Idempotency check: Skip already processed webhooks
    if (deliveryId) {
      const existing = await prisma.processedWebhook.findUnique({
        where: { deliveryId },
      });

      if (existing) {
        logger.info({ deliveryId }, 'Webhook already processed, skipping');
        res.status(200).json({ success: true, message: 'Duplicate webhook ignored' });
        return;
      }

      // Record this webhook delivery
      await prisma.processedWebhook.create({
        data: { deliveryId, event },
      });
    }

    const payload = req.body as GithubWebhookDto;
    const action = payload.action;

    // Only process supported PR actions
    if (!SUPPORTED_ACTIONS.includes(action)) {
      logger.info({ action }, 'Unsupported PR action, ignoring');
      res.status(200).json({ success: true, message: 'Action ignored' });
      return;
    }

    logger.info(
      {
        repo: payload.repository?.full_name,
        prNumber: payload.pull_request?.number,
        action,
      },
      'Enqueuing PR review job'
    );

    // 2. Add job to BullMQ queue
    await addReviewJob(payload);

    // 3. Respond immediately to GitHub (under 10s requirement)
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}
