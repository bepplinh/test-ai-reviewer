import { Request, Response, NextFunction } from 'express';
import {
  getAllReviews,
  getReviewRunById,
} from './review.repository';
import { logger } from '../../shared/utils/logger';
import { prisma } from '../../prisma/client';

/**
 * GET /api/reviews
 * Returns a list of all review runs.
 */
export async function listReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reviews = await getAllReviews();
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reviews/:id
 * Returns full detail of a single review run including issues and tokens.
 */
export async function getReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id'];
    if (!id) {
      res.status(400).json({ error: 'Invalid review ID' });
      return;
    }
    const run = await getReviewRunById(id);

    if (!run) {
      res.status(404).json({ error: 'Review run not found' });
      return;
    }

    res.status(200).json({
      id: run.id,
      repository: run.pullRequest.repoName,
      owner: run.pullRequest.repoOwner,
      prNumber: run.pullRequest.prNumber,
      prTitle: run.pullRequest.prTitle,
      author: run.pullRequest.author,
      status: run.status,
      summary: run.aiSummary,
      usage: {
        inputTokens: run.inputTokens,
        outputTokens: run.outputTokens,
        totalTokens: run.totalTokens,
        cost: run.estimatedCostUsd,
      },
      issues: run.comments.map((c) => ({
        severity: c.severity,
        type: c.type,
        message: c.message,
        suggestion: c.suggestion,
        filePath: c.filePath,
        line: c.line,
      })),
      timings: {
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        createdAt: run.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/stats
 * Returns aggregated stats (total runs, total cost, etc.)
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalReviews = await prisma.reviewRun.count();
    const failedReviews = await prisma.reviewRun.count({ where: { status: 'FAILED' } });
    const aggregations = await prisma.reviewRun.aggregate({
      _sum: {
        totalTokens: true,
        estimatedCostUsd: true,
      },
    });

    res.status(200).json({
      totalReviews,
      failedReviews,
      totalTokens: aggregations._sum.totalTokens || 0,
      totalCostUsd: aggregations._sum.estimatedCostUsd || 0,
    });
  } catch (error) {
    next(error);
  }
}
