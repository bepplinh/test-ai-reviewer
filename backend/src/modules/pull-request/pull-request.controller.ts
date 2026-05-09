import { Request, Response, NextFunction } from 'express';
import {
  getAllPullRequests,
  getPullRequestById,
  getPullRequestByRepoAndNumber,
} from './pull-request.repository';

/**
 * GET /api/pull-requests
 * Returns all Pull Requests with the summary of their latest review run.
 */
export async function listPullRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pullRequests = await getAllPullRequests();

    const shaped = pullRequests.map((pr) => {
      const latestRun = pr.reviews[0];
      return {
        id: pr.id,
        repoOwner: pr.repoOwner,
        repoName: pr.repoName,
        prNumber: pr.prNumber,
        prTitle: pr.prTitle,
        author: pr.author,
        baseBranch: pr.baseBranch,
        headBranch: pr.headBranch,
        githubUrl: pr.githubUrl,
        latestReview: latestRun
          ? {
              id: latestRun.id,
              status: latestRun.status,
              aiSummary: latestRun.aiSummary,
              issueCount: latestRun._count.comments,
              totalTokens: latestRun.totalTokens,
              estimatedCostUsd: latestRun.estimatedCostUsd,
              completedAt: latestRun.completedAt,
              createdAt: latestRun.createdAt,
            }
          : null,
        createdAt: pr.createdAt,
        updatedAt: pr.updatedAt,
      };
    });

    res.status(200).json(shaped);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/pull-requests/:id
 * Returns a single Pull Request with its full review run history.
 */
export async function getPullRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json({ error: 'Invalid Pull Request ID' });
      return;
    }

    const pr = await getPullRequestById(id);

    if (!pr) {
      res.status(404).json({ error: 'Pull Request not found' });
      return;
    }

    res.status(200).json({
      id: pr.id,
      repoOwner: pr.repoOwner,
      repoName: pr.repoName,
      prNumber: pr.prNumber,
      prTitle: pr.prTitle,
      author: pr.author,
      baseBranch: pr.baseBranch,
      headBranch: pr.headBranch,
      headSha: pr.headSha,
      githubUrl: pr.githubUrl,
      reviewHistory: pr.reviews.map((run) => ({
        id: run.id,
        status: run.status,
        modelName: run.modelName,
        promptVersion: run.promptVersion,
        aiSummary: run.aiSummary,
        usage: {
          inputTokens: run.inputTokens,
          outputTokens: run.outputTokens,
          totalTokens: run.totalTokens,
          estimatedCostUsd: run.estimatedCostUsd,
        },
        issues: run.comments,
        timings: {
          startedAt: run.startedAt,
          completedAt: run.completedAt,
          createdAt: run.createdAt,
        },
        errorMessage: run.errorMessage,
      })),
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/pull-requests/search?owner=...&repo=...&prNumber=...
 * Lookup a specific PR by its GitHub coordinates.
 */
export async function searchPullRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { owner, repo, prNumber } = req.query;

    if (!owner || !repo || !prNumber) {
      res.status(400).json({ error: 'Query params owner, repo, and prNumber are required' });
      return;
    }

    const pr = await getPullRequestByRepoAndNumber(
      owner as string,
      repo as string,
      parseInt(prNumber as string, 10)
    );

    if (!pr) {
      res.status(404).json({ error: 'Pull Request not found' });
      return;
    }

    res.status(200).json(pr);
  } catch (error) {
    next(error);
  }
}
