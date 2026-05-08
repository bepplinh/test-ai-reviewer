import { Request, Response, NextFunction } from 'express';
import { processPullRequestReview } from '../services/review.service';
import { GithubWebhookDto } from '../types/github.types';
import { logger } from '../utils/logger';

const SUPPORTED_ACTIONS = ['opened', 'synchronize'];

/**
 * POST /api/webhooks/github
 * Receives GitHub webhook events and triggers PR review pipeline.
 */
export async function handleGithubWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const event = req.headers['x-github-event'] as string;
    logger.info({ event }, 'Webhook received');

    // Only process pull_request events
    if (event !== 'pull_request') {
      res.status(200).json({ success: true, message: 'Event ignored' });
      return;
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
      'Processing PR review'
    );

    // Respond immediately to GitHub to prevent timeout,
    // then process asynchronously in the background
    res.status(200).json({ success: true });

    // Fire and forget - errors are handled inside the service
    processPullRequestReview(payload).catch((err) => {
      logger.error({ error: err.message }, 'Unhandled error in review pipeline');
    });
  } catch (error) {
    next(error);
  }
}
