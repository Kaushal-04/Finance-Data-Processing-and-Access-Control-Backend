import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import * as recordController from '../controllers/record.controller';

const router = Router();

router.use(authenticate);

// Analysts and Admins can view records
router.get('/', requireRole(['ANALYST', 'ADMIN']), recordController.getRecords);
router.get('/:id', requireRole(['ANALYST', 'ADMIN']), recordController.getRecordById);

// Only Admins can modify records
router.post('/', requireRole(['ADMIN']), recordController.createRecord);
router.put('/:id', requireRole(['ADMIN']), recordController.updateRecord);
router.delete('/:id', requireRole(['ADMIN']), recordController.deleteRecord);

export default router;
