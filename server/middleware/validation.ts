import { body, param, query } from 'express-validator';

// Employee validation
export const validateCreateEmployee = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 50 })
    .withMessage('Department must not exceed 50 characters'),
  
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ max: 50 })
    .withMessage('Position must not exceed 50 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Valid phone number is required'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const validateUpdateEmployee = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid employee ID is required'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department must not exceed 50 characters'),
  
  body('position')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Position must not exceed 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Valid phone number is required'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Authentication validation
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

export const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Role must be either admin or employee')
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Notification validation
export const validateNotification = [
  body('type')
    .isIn(['email', 'sms', 'both'])
    .withMessage('Type must be email, sms, or both'),
  
  body('employeeId')
    .isInt({ min: 1 })
    .withMessage('Valid employee ID is required'),
  
  body('guestName')
    .trim()
    .notEmpty()
    .withMessage('Guest name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters'),
  
  body('guestPhone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Valid phone number is required'),
  
  body('guestEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ max: 200 })
    .withMessage('Purpose must not exceed 200 characters'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters')
];

// Activity log validation
export const validateActivityLog = [
  body('employeeId')
    .isInt({ min: 1 })
    .withMessage('Valid employee ID is required'),
  
  body('guestName')
    .trim()
    .notEmpty()
    .withMessage('Guest name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Guest name must be between 2 and 100 characters'),
  
  body('guestPhone')
    .optional()
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Valid phone number is required'),
  
  body('guestEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ max: 200 })
    .withMessage('Purpose must not exceed 200 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

// Generic validators
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
