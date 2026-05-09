import { env } from './config/env';
import app from './app';
import { logger } from './shared/utils/logger';
import './modules/queue/review.worker'; // Initialize the BullMQ worker

app.listen(env.PORT, () => {
  logger.info(`🚀 AI PR Reviewer (V2) is running on port ${env.PORT}`);
});
