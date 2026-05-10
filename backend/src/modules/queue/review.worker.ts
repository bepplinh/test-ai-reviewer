import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../../shared/utils/redis';
import { logger } from '../../shared/utils/logger';
import { QUEUE_NAME } from './review.queue';
import { processPullRequestReview } from '../review/review.service';
import { GithubWebhookDto } from '../github/github.types';

export const reviewWorker = new Worker(
  QUEUE_NAME,
  async (job: Job<GithubWebhookDto>) => {
    const { pull_request, repository } = job.data;
    const prNumber = pull_request.number;
    const repoName = repository.full_name;

    logger.info({ jobId: job.id, repoName, prNumber }, 'Worker processing review job');

    try {
      await processPullRequestReview(job.data);
      logger.info({ jobId: job.id, prNumber }, 'Worker completed review job');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ jobId: job.id, prNumber, error: message }, 'Worker failed review job');
      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Limit concurrent reviews to manage load/cost
  }
);

reviewWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Job failed permanently');
});
