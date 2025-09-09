import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../config/database';
import { validate } from '../middleware/validate.js';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = express.Router();

// Simple admin dashboard info
router.get('/dashboard', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  try {
    // Get basic stats
    const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees WHERE is_active = 1').get();
    const todayLogs = db.prepare(`
      SELECT COUNT(*) as count FROM activity_logs 
      WHERE DATE(check_in_time) = DATE('now')
    `).get();
    
    res.json({
      employees: employeeCount.count,
      todayVisitors: todayLogs.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
