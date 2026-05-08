import { GithubWebhookDto } from '../github/github.types';
import {
  getPullRequestFiles,
  createPullRequestComment,
  buildDiffString,
} from '../github/github.service';
import { generateReview } from '../ai/openai.service';
import { buildGithubComment } from '../comment/comment.service';
import { buildReviewPrompt } from '../ai/prompt.templates';
import {
  createReviewRun,
  updateReviewStatus,
  markReviewCompleted,
} from './review.repository';
import { logger } from '../../shared/utils/logger';

/**
 * Orchestrates the full PR review pipeline (V2 Production Ready).
 * This is called by the BullMQ worker.
 */
export async function processPullRequestReview(
  payload: GithubWebhookDto
): Promise<void> {
  const { pull_request, repository } = payload;
  const [owner, repo] = repository.full_name.split('/');
  const prNumber = pull_request.number;

  // Step 1: Initialize Review Run in DB
  const reviewRun = await createReviewRun({
    repoOwner: owner,
    repoName: repo,
    prNumber,
    prTitle: pull_request.title,
    author: pull_request.user.login,
    baseBranch: pull_request.base.ref,
    headBranch: pull_request.head.ref,
    headSha: pull_request.head.sha,
    githubUrl: pull_request.html_url,
  });

  const runId = reviewRun.id;
  logger.info({ runId, repo: repository.full_name, prNumber }, 'Review run initialized');

  try {
    // Step 2: Fetch and Filter PR Files
    await updateReviewStatus(runId, 'FETCHING_PR');
    const files = await getPullRequestFiles(owner, repo, prNumber);

    if (files.length === 0) {
      logger.warn({ runId }, 'No reviewable files found');
      await updateReviewStatus(runId, 'FAILED', 'No reviewable files found');
      return;
    }

    // Step 3: AI Analysis
    await updateReviewStatus(runId, 'ANALYZING');
    const diffString = buildDiffString(files);
    const prompt = buildReviewPrompt(pull_request.title, pull_request.body, diffString);

    const { result, usage } = await generateReview(prompt);

    // Step 4: Save Result
    await markReviewCompleted(runId, result, usage);

    // Step 5: Post GitHub Comment
    await updateReviewStatus(runId, 'COMMENTING');
    const commentBody = buildGithubComment(result);
    await createPullRequestComment(owner, repo, prNumber, commentBody);

    await updateReviewStatus(runId, 'COMPLETED');
    logger.info({ runId }, 'Review completed successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ runId, error: message }, 'Review process failed');
    await updateReviewStatus(runId, 'FAILED', message);
    throw error; // Rethrow for BullMQ retry
  }
}
