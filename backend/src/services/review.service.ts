import { GithubWebhookDto } from '../types/github.types';
import {
  getPullRequestFiles,
  createPullRequestComment,
  buildDiffString,
} from './github.service';
import { generateReview } from './openai.service';
import { buildGithubComment } from './comment.service';
import { buildReviewPrompt } from '../prompts/review.prompt';
import {
  createReview,
  markReviewProcessing,
  markReviewCompleted,
  markReviewFailed,
} from '../repositories/review.repository';
import { logger } from '../utils/logger';

/**
 * Orchestrates the full PR review pipeline:
 * webhook → fetch files → AI review → save DB → comment PR
 */
export async function processPullRequestReview(
  payload: GithubWebhookDto
): Promise<void> {
  const { pull_request, repository } = payload;
  const [owner, repo] = repository.full_name.split('/');
  const pullNumber = pull_request.number;

  // Step 1: Create a pending review record
  const review = await createReview({
    repoName: repository.full_name,
    prNumber: pullNumber,
    prTitle: pull_request.title,
    author: pull_request.user.login,
  });

  logger.info(
    { reviewId: review.id, repo: repository.full_name, prNumber: pullNumber },
    'Pending review created'
  );

  try {
    // Step 2: Mark as processing
    await markReviewProcessing(review.id);

    // Step 3: Fetch changed files from GitHub
    logger.info({ prNumber: pullNumber }, 'Fetching PR files');
    const files = await getPullRequestFiles(owner, repo, pullNumber);

    if (files.length === 0) {
      logger.warn({ prNumber: pullNumber }, 'No reviewable files found in PR');
      await markReviewFailed(review.id, 'No reviewable files found in this PR');
      return;
    }

    // Step 4: Build AI prompt
    const diffString = buildDiffString(files);
    const prompt = buildReviewPrompt(
      pull_request.title,
      pull_request.body,
      diffString
    );

    // Step 5: Generate AI review
    logger.info({ prNumber: pullNumber }, 'Generating AI review');
    const aiResult = await generateReview(prompt);

    // Step 6: Save review result to database
    logger.info({ reviewId: review.id }, 'Saving review result');
    await markReviewCompleted(review.id, aiResult);

    // Step 7: Post comment back to GitHub PR
    const commentBody = buildGithubComment(aiResult);
    logger.info({ prNumber: pullNumber }, 'Posting GitHub PR comment');
    await createPullRequestComment(owner, repo, pullNumber, commentBody);

    logger.info(
      { reviewId: review.id, prNumber: pullNumber },
      'Review completed successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(
      { reviewId: review.id, prNumber: pullNumber, error: message },
      'Review processing failed'
    );
    await markReviewFailed(review.id, message);
  }
}
