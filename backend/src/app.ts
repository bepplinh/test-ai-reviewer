import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import webhookRoutes from './modules/webhook/webhook.route';
import reviewRoutes from './modules/review/review.route';
import pullRequestRoutes from './modules/pull-request/pull-request.route';
import { errorMiddleware } from './shared/middlewares/error.middleware';

const app: Application = express();

// Security headers
app.use(helmet());
app.use(cors());

// Capture raw body for webhook signature verification BEFORE json parsing
// Also manually parse JSON here because reading the stream consumes it,
// making express.json() unable to parse it afterwards.
app.use(
  (req: Request & { rawBody?: string }, _res, next) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      // Manually parse JSON body so req.body is available for all routes
      if (data) {
        try {
          req.body = JSON.parse(data);
        } catch {
          // Not JSON — leave req.body as-is, express.json() fallback won't help anyway
        }
      }
      next();
    });
  }
);

// Health check
app.get('/health', (_req, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/pull-requests', pullRequestRoutes);

// Centralized error handler (must be LAST)
app.use(errorMiddleware);

export default app;
