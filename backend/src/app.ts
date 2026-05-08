import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import webhookRoutes from './routes/webhook.route';
import reviewRoutes from './routes/review.route';
import { errorMiddleware } from './middlewares/error.middleware';

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

// Centralized error handler (must be LAST)
app.use(errorMiddleware);

export default app;
