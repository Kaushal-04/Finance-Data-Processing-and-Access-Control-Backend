import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as dashboardController from '../controllers/dashboard.controller';

const router = Router();

// Dashboard data is available to VIEWER, ANALYST, and ADMIN (everyone authenticated natively)
router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/category-totals', dashboardController.getCategoryTotals);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/trends', dashboardController.getTrends);

export default router;
