import { Router, type IRouter } from 'express';
import { handleGithubWebhook } from './webhook.controller';
import { verifyGithubSignature } from '../../shared/middlewares/verify-signature.middleware';

const router: IRouter = Router();

/**
 * POST /api/webhooks/github
 *
 * Note: This route uses express.raw() to capture the raw body for
 * HMAC signature verification. The rawBody is attached to req before
 * being parsed as JSON.
 */
router.post('/github', verifyGithubSignature, handleGithubWebhook);

export default router;
