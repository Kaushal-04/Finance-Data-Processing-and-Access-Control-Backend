import { Router } from 'express';
// import { authenticate } from '../middlewares/auth.middleware';
// import { requireRole } from '../middlewares/role.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.registerAdmin); // for bootstrapping

export default router;
