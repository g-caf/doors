import { Router } from 'express';
import { register, login, getProfile, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateLogin, validateRegister, validateChangePassword } from '../middleware/validation.js';
import { authLimiter } from '../middleware/security.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validateRegister, validate, register);
router.post('/login', authLimiter, validateLogin, validate, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/change-password', authenticateToken, validateChangePassword, validate, changePassword);

export default router;
