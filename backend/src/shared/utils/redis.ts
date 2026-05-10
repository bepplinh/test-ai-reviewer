import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redisConnection.on('connect', () => {
  logger.info('Redis connected');
});
