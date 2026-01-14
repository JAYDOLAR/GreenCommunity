import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { 
  registerUser, 
  loginUser, 
  verifyEmail,
  verifyEmailCode,
  resendVerificationCode, 
  requestPasswordReset, 
  resetPassword, 
  getCurrentUser, 
  logout, 
  changePassword,
  verifyResetCode,
  updatePasswordWithCode,
  updatePassword,
  updateProfile,
  updateNotificationPreferences,
  updateAppPreferences,
  getUserSettings,
  generate2FASecret,
  verify2FAToken,
  disable2FA,
  verify2FALogin,
  refresh2FAToken,
  getTrustedDevices,
  removeTrustedDevice,
  clearAllTrustedDevices,
  generateToken,
  getUserStreak,
  exportUserData,
  deleteUserAccount
} from '../controllers/auth.controller.js';
import { 
  validateRegister, 
  validateLogin, 
  validatePasswordResetRequest, 
  validatePasswordReset,
  validateVerifyResetCode,
  validateUpdatePasswordWithCode,
  validateUpdatePassword
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: 5 * 60 * 1000 // 5 minutes in milliseconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 forgot password requests per windowMs
  message: {
    error: 'Too many password reset requests, please try again later.',
    retryAfter: 15 * 60 * 1000 // 15 minutes in milliseconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

const router = express.Router();

// Authentication Routes
router.post('/register', validateRegister, registerUser);
router.post('/login', loginLimiter, validateLogin, loginUser);
router.post('/logout', logout);

// Email Verification
router.post('/verify-email', verifyEmail);
router.post('/verify-email-code', verifyEmailCode);
router.post('/resend-verification-code', resendVerificationCode);

// Password Reset
router.post('/forgot-password', forgotPasswordLimiter, validatePasswordResetRequest, requestPasswordReset);
router.post('/reset-password', validatePasswordReset, resetPassword);
router.post('/verify-reset-code', validateVerifyResetCode, verifyResetCode);
router.post('/update-password-with-code', validateUpdatePasswordWithCode, updatePasswordWithCode);

// Protected Routes
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePassword);
router.post('/update-password', authenticate, validateUpdatePassword, updatePassword);

// Settings Routes
router.get('/settings', authenticate, getUserSettings);
router.post('/update-profile', authenticate, updateProfile);
router.post('/update-notifications', authenticate, updateNotificationPreferences);
router.post('/update-preferences', authenticate, updateAppPreferences);

// Data Management Routes
router.post('/export-data', authenticate, exportUserData);
router.delete('/delete-account', authenticate, deleteUserAccount);

// Two-Factor Authentication Routes
router.post('/2fa/generate', authenticate, generate2FASecret);
router.post('/2fa/verify', authenticate, verify2FAToken);
router.post('/2fa/disable', authenticate, disable2FA);
router.post('/2fa/verify-login', verify2FALogin);
router.post('/2fa/refresh-token', refresh2FAToken);

// Trusted Devices Routes
router.get('/trusted-devices', authenticate, getTrustedDevices);
router.delete('/trusted-devices/:deviceId', authenticate, removeTrustedDevice);
router.delete('/trusted-devices', authenticate, clearAllTrustedDevices);

// Google OAuth - Start login flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth - Callback after login
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/failure' }),
  (req, res) => {
    try {
      const redirectUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      
      // Get accurate IP address (handle proxies/load balancers)
      const getClientIP = (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               req.ip ||
               'unknown';
      };
      
      // If account is locked/suspended, do not proceed to 2FA or login
      if ((req.user.lockUntil && req.user.lockUntil > new Date()) || req.user.isLocked) {
        return res.redirect(`${redirectUrl}/blocked`);
      }

      // Check if user actually has 2FA enabled
      if (req.user.twoFactorEnabled) {
        // Check if this device is trusted
        const userAgent = req.get('User-Agent');
        const ipAddress = getClientIP(req);
        
        if (req.user.isDeviceTrusted(userAgent, ipAddress)) {
          // Device is trusted, skip 2FA
          const token = generateToken(req.user._id);

          // Update last login info
          req.user.lastLogin = new Date();
          req.user.ipAddress = ipAddress;
          req.user.userAgent = userAgent;
          req.user.save();

          // Set HTTP-only cookie for security
          res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
          });

          // Redirect with token as URL parameter for client-side storage
          return res.redirect(`${redirectUrl}/dashboard?auth=success&token=${token}`);
        }
        
        // Device not trusted - require 2FA verification
        const tempToken = generateToken(req.user._id, 'temp-2fa');
        
        return res.redirect(`${redirectUrl}/login?requires2FA=true&tempToken=${tempToken}`);
      }
      
      // No 2FA required - proceed with normal login
      const token = generateToken(req.user._id);

      // Update last login info
      req.user.lastLogin = new Date();
      req.user.ipAddress = getClientIP(req);
      req.user.userAgent = req.get('User-Agent');
      req.user.save();

      // Set HTTP-only cookie for security
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Redirect with token as URL parameter for client-side storage
      res.redirect(`${redirectUrl}/dashboard?auth=success&token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  }
);

// OAuth failure route
router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Google login failed' });
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ message: 'Auth service is healthy' });
});

// Get user streak information
router.get('/streak', authenticate, getUserStreak);

// User notifications
import { 
  getUserNotifications, 
  markUserNotificationAsRead, 
  markAllUserNotificationsAsRead 
} from '../controllers/notification.controller.js';

router.get('/notifications', authenticate, getUserNotifications);
router.put('/notifications/:id/read', authenticate, markUserNotificationAsRead);
router.put('/notifications/read-all', authenticate, markAllUserNotificationsAsRead);

export default router;
