import { Queue } from 'bullmq';
import { redisConnection } from '../../shared/utils/redis';
import { logger } from '../../shared/utils/logger';

export const QUEUE_NAME = 'review-queue';

export const reviewQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export async function addReviewJob(data: any) {
  const jobName = `review-${data.pull_request.number}-${Date.now()}`;
  await reviewQueue.add(jobName, data);
  logger.info({ prNumber: data.pull_request.number, jobName }, 'Review job added to queue');
}
