import { prisma } from '../prisma/client';
import { AIReviewResponse } from '../types/review.types';

/**
 * Creates a new review record with PENDING status.
 */
export async function createReview(data: {
  repoName: string;
  prNumber: number;
  prTitle: string;
  author: string;
}) {
  return prisma.review.create({
    data: {
      repoName: data.repoName,
      prNumber: data.prNumber,
      prTitle: data.prTitle,
      author: data.author,
      status: 'PENDING',
    },
  });
}

/**
 * Updates a review to PROCESSING status.
 */
export async function markReviewProcessing(reviewId: string) {
  return prisma.review.update({
    where: { id: reviewId },
    data: { status: 'PROCESSING' },
  });
}

/**
 * Saves AI review result and marks review as COMPLETED.
 */
export async function markReviewCompleted(
  reviewId: string,
  aiResult: AIReviewResponse
) {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      status: 'COMPLETED',
      aiSummary: aiResult.summary,
      comments: {
        create: aiResult.issues.map((issue) => ({
          severity: issue.severity,
          category: issue.category,
          message: issue.message,
          suggestion: issue.suggestion,
          filePath: issue.filePath ?? null,
          line: issue.line ?? null,
        })),
      },
    },
  });
}

/**
 * Marks a review as FAILED and saves the error message.
 */
export async function markReviewFailed(reviewId: string, errorMessage: string) {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      status: 'FAILED',
      errorMessage,
    },
  });
}

/**
 * Fetches all reviews (for dashboard listing).
 */
export async function getAllReviews() {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      repoName: true,
      prNumber: true,
      prTitle: true,
      author: true,
      status: true,
      createdAt: true,
    },
  });
}

/**
 * Fetches a single review with full details and comments.
 */
export async function getReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: {
      comments: {
        select: {
          id: true,
          severity: true,
          category: true,
          message: true,
          suggestion: true,
          filePath: true,
          line: true,
        },
      },
    },
  });
}
