import { Router } from 'express';
import {
  sendNotification,
  testEmailConfiguration,
  testSMSConfiguration,
  getNotificationSettings,
  bulkNotify
} from '../controllers/notificationController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateNotification } from '../middleware/validation.js';
import { notificationLimiter } from '../middleware/security.js';

const router = Router();

// Public route for guest check-in notifications
router.post('/', notificationLimiter, validateNotification, validate, sendNotification);

// Protected routes (admin only)
router.get('/settings', authenticateToken, requireAdmin, getNotificationSettings);
router.post('/test/email', authenticateToken, requireAdmin, testEmailConfiguration);
router.post('/test/sms', authenticateToken, requireAdmin, testSMSConfiguration);
router.post('/bulk', authenticateToken, requireAdmin, notificationLimiter, bulkNotify);

export default router;
