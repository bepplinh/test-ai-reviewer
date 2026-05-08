import { AIReviewResponse } from '../types/review.types';
import { buildGithubCommentBody } from '../utils/formatter';

/**
 * Builds the formatted GitHub comment body from an AI review result.
 */
export function buildGithubComment(reviewResult: AIReviewResponse): string {
  return buildGithubCommentBody(reviewResult);
}
