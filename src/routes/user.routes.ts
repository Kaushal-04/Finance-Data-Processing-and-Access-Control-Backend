import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

// Only ADMIN can manage users
router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
