import { Router } from 'express';
import {
  getAllActivityLogs,
  createActivityLog,
  checkOut,
  getActivityStats,
  getEmployeeVisitors
} from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateActivityLog, validateId, validatePagination } from '../middleware/validation.js';
import { generalLimiter } from '../middleware/security.js';

const router = Router();

// Public routes (for guest check-in)
router.post('/', generalLimiter, validateActivityLog, validate, createActivityLog);
router.put('/:id/checkout', generalLimiter, validateId, validate, checkOut);

// Protected routes (for admin dashboard)
router.get('/', authenticateToken, validatePagination, validate, getAllActivityLogs);
router.get('/stats', authenticateToken, getActivityStats);
router.get('/employee/:id', authenticateToken, validateId, validate, getEmployeeVisitors);

export default router;
