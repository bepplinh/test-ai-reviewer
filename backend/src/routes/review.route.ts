import { Router, type IRouter } from 'express';
import {
  listReviews,
  getReview,
  retryReview,
} from '../controllers/review.controller';

const router: IRouter = Router();

// GET /api/reviews
router.get('/', listReviews);

// GET /api/reviews/:id
router.get('/:id', getReview);

// POST /api/reviews/:id/retry
router.post('/:id/retry', retryReview);

export default router;
