import { AIReviewResponse } from '../ai/ai.types';
import { buildGithubCommentBody } from '../../shared/utils/formatter';

/**
 * Builds the formatted GitHub comment body from an AI review result.
 */
export function buildGithubComment(reviewResult: AIReviewResponse): string {
  return buildGithubCommentBody(reviewResult);
}
