import { Router, type IRouter } from 'express';
import {
  listReviews,
  getReview,
  getStats,
} from './review.controller';

const router: IRouter = Router();

// GET /api/reviews
router.get('/', listReviews);

// GET /api/stats
router.get('/stats', getStats);

// GET /api/reviews/:id
router.get('/:id', getReview);

export default router;
