import { body } from 'express-validator';

// Registration validation
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-\'\.\_]+$/)
    .withMessage('Name can only contain letters, numbers, spaces, hyphens, apostrophes, dots, and underscores'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom(value => {
      // Check for common passwords
      const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common. Please choose a stronger password.');
      }
      return true;
    })
];

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Password reset request validation
export const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Password reset validation
export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Email change validation
export const validateEmailChange = [
  body('newEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),

  body('password')
    .notEmpty()
    .withMessage('Current password is required')
];

// Verify reset code validation
export const validateVerifyResetCode = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be exactly 6 digits')
    .matches(/^[0-9]{6}$/)
    .withMessage('Code must contain only numbers')
];

// Update password with code validation
export const validateUpdatePasswordWithCode = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be exactly 6 digits')
    .matches(/^[0-9]{6}$/)
    .withMessage('Code must contain only numbers'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom(value => {
      // Check for common passwords
      const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common. Please choose a stronger password.');
      }
      return true;
    })
];

// Update password for authenticated users validation
export const validateUpdatePassword = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom(value => {
      // Check for common passwords
      const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common. Please choose a stronger password.');
      }
      return true;
    })
];

// Wallet link validation
export const validateLinkWallet = [
  body('address')
    .isString().withMessage('address required')
    .matches(/^0x[a-fA-F0-9]{40}$/).withMessage('invalid address'),
  body('chain').optional().isString()
];

// Approve & register project validation
export const validateApproveProject = [
  body('totalCredits').isInt({ min: 1 }).withMessage('totalCredits must be >0'),
  body('pricePerCreditWei').isString().matches(/^[0-9]+$/).withMessage('pricePerCreditWei numeric string required'),
  body('metadataURI').isString().withMessage('metadataURI required')
];

// Fiat grant validation
export const validateGrantFiat = [
  body('buyerAddress').matches(/^0x[a-fA-F0-9]{40}$/).withMessage('invalid buyerAddress'),
  body('amount').isInt({ min:1 }).withMessage('amount must be >0'),
  body('receiptId').isString().withMessage('receiptId required'),
  body('retireImmediately').optional().isBoolean(),
  body('certificateURI').optional().isString()
];

// Record crypto purchase validation
export const validateRecordPurchase = [
  body('txHash').matches(/^0x([A-Fa-f0-9]{64})$/).withMessage('invalid txHash')
];
