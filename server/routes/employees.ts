import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments
} from '../controllers/employeeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateCreateEmployee, validateUpdateEmployee, validateId, validatePagination } from '../middleware/validation.js';
import { uploadPhoto } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/security.js';

const router = Router();

// Public routes (for guest check-in interface)
router.get('/', getAllEmployees);
router.get('/departments', getDepartments);
router.get('/:id', getEmployeeById);

// Protected routes (admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin,
  uploadLimiter,
  uploadPhoto.single('photo'),
  validateCreateEmployee,
  validate,
  createEmployee
);

router.put('/:id',
  authenticateToken,
  requireAdmin,
  uploadLimiter,
  uploadPhoto.single('photo'),
  validateUpdateEmployee,
  validate,
  updateEmployee
);

router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateId,
  validate,
  deleteEmployee
);

export default router;
