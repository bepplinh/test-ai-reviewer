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
app.use(
  (req: Request & { rawBody?: string }, _res, next) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  }
);

// Parse JSON body for all other routes
app.use(express.json());

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
