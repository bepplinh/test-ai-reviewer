import { prisma } from '../../prisma/client';
import { AIReviewResponse } from '../../modules/ai/ai.types';
import { ReviewStatus } from '@prisma/client';

/**
 * Upserts a PullRequest and creates a new ReviewRun record.
 */
export async function createReviewRun(data: {
  repoOwner: string;
  repoName: string;
  prNumber: number;
  prTitle: string;
  author: string;
  baseBranch: string;
  headBranch: string;
  headSha: string;
  githubUrl: string;
}) {
  const pullRequest = await prisma.pullRequest.upsert({
    where: {
      repoOwner_repoName_prNumber: {
        repoOwner: data.repoOwner,
        repoName: data.repoName,
        prNumber: data.prNumber,
      },
    },
    update: {
      prTitle: data.prTitle,
      author: data.author,
      baseBranch: data.baseBranch,
      headBranch: data.headBranch,
      headSha: data.headSha,
      githubUrl: data.githubUrl,
    },
    create: {
      repoOwner: data.repoOwner,
      repoName: data.repoName,
      prNumber: data.prNumber,
      prTitle: data.prTitle,
      author: data.author,
      baseBranch: data.baseBranch,
      headBranch: data.headBranch,
      headSha: data.headSha,
      githubUrl: data.githubUrl,
    },
  });

  return prisma.reviewRun.create({
    data: {
      pullRequestId: pullRequest.id,
      status: 'RECEIVED',
      modelName: process.env.OPENAI_MODEL || 'gpt-4o',
      promptVersion: '2.0.0',
    },
  });
}

export async function updateReviewStatus(runId: string, status: ReviewStatus, errorMessage?: string) {
  return prisma.reviewRun.update({
    where: { id: runId },
    data: { status, errorMessage },
  });
}

export async function markReviewCompleted(
  runId: string,
  aiResult: AIReviewResponse,
  usage: { inputTokens: number; outputTokens: number; totalTokens: number; cost: number }
) {
  return prisma.reviewRun.update({
    where: { id: runId },
    data: {
      status: 'COMPLETED',
      aiSummary: aiResult.summary,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      estimatedCostUsd: usage.cost,
      completedAt: new Date(),
      comments: {
        create: aiResult.issues.map((issue) => ({
          severity: issue.severity,
          type: issue.type,
          message: issue.message,
          suggestion: issue.suggestion,
          filePath: issue.filePath,
          line: issue.line,
        })),
      },
    },
  });
}

export async function getReviewRunById(id: string) {
  return prisma.reviewRun.findUnique({
    where: { id },
    include: {
      pullRequest: true,
      comments: true,
    },
  });
}

export async function getAllReviews() {
  return prisma.reviewRun.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pullRequest: {
        select: {
          repoName: true,
          prNumber: true,
          author: true,
        },
      },
    },
  });
}
