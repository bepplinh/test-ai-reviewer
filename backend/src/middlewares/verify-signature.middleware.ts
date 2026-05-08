import { Request, Response, NextFunction } from 'express';
import { verifyWebhookSignature } from '../services/github.service';
import { logger } from '../utils/logger';

/**
 * Middleware that verifies the GitHub webhook HMAC-SHA256 signature.
 * Requires express.raw() to be used on the webhook route, NOT express.json().
 */
export function verifyGithubSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers['x-hub-signature-256'] as string;

  if (!signature) {
    logger.warn('Missing x-hub-signature-256 header');
    res.status(401).json({ error: 'Missing webhook signature' });
    return;
  }

  const payload = (req as Request & { rawBody?: string }).rawBody ?? '';

  const isValid = verifyWebhookSignature(signature, payload);

  if (!isValid) {
    logger.warn('Invalid webhook signature');
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }

  logger.info('Webhook signature verified');
  next();
}
