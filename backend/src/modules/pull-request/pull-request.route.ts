import { Router, type IRouter } from 'express';
import {
  listPullRequests,
  getPullRequest,
  searchPullRequest,
} from './pull-request.controller';

const router: IRouter = Router();

// GET /api/pull-requests
router.get('/', listPullRequests);

// GET /api/pull-requests/search?owner=...&repo=...&prNumber=...
router.get('/search', searchPullRequest);

// GET /api/pull-requests/:id
router.get('/:id', getPullRequest);

export default router;
