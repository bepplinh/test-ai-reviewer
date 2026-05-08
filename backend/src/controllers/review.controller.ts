import { Request, Response, NextFunction } from 'express';
import {
  getAllReviews,
  getReviewById,
} from '../repositories/review.repository';
import { logger } from '../utils/logger';

/**
 * GET /api/reviews
 * Returns a list of all reviews.
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
 * Returns full detail of a single review including issues.
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
    const review = await getReviewById(id);

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // Shape the response to match API contract
    res.status(200).json({
      id: review.id,
      repoName: review.repoName,
      prNumber: review.prNumber,
      prTitle: review.prTitle,
      author: review.author,
      status: review.status,
      summary: review.aiSummary,
      issues: review.comments.map((c) => ({
        severity: c.severity,
        category: c.category,
        message: c.message,
        suggestion: c.suggestion,
        filePath: c.filePath,
        line: c.line,
      })),
      createdAt: review.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/reviews/:id/retry
 * Placeholder for retry endpoint (optional advanced feature).
 */
export async function retryReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    logger.info({ reviewId: id }, 'Review retry requested');

    // TODO: implement retry logic (queue-based in advanced version)
    res.status(200).json({ success: true, message: 'Review retry queued' });
  } catch (error) {
    next(error);
  }
}
