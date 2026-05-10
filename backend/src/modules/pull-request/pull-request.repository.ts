import { prisma } from '../../prisma/client';

/**
 * Fetches all Pull Requests with a summary of their latest review run.
 */
export async function getAllPullRequests() {
  return prisma.pullRequest.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Only the latest run per PR
        select: {
          id: true,
          status: true,
          aiSummary: true,
          totalTokens: true,
          estimatedCostUsd: true,
          completedAt: true,
          createdAt: true,
          _count: { select: { comments: true } },
        },
      },
    },
  });
}

/**
 * Fetches a single PullRequest with its full review run history.
 */
export async function getPullRequestById(id: string) {
  return prisma.pullRequest.findUnique({
    where: { id },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          comments: {
            select: {
              id: true,
              severity: true,
              type: true,
              message: true,
              suggestion: true,
              filePath: true,
              line: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Fetches a PullRequest by its repo and PR number (used for webhook dedup).
 */
export async function getPullRequestByRepoAndNumber(
  repoOwner: string,
  repoName: string,
  prNumber: number
) {
  return prisma.pullRequest.findUnique({
    where: {
      repoOwner_repoName_prNumber: { repoOwner, repoName, prNumber },
    },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
          completedAt: true,
          totalTokens: true,
          estimatedCostUsd: true,
        },
      },
    },
  });
}
