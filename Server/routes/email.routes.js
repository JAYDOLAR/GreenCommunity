import express from 'express';
import { sendInvoiceEmail } from '../controllers/email.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Require authentication to prevent email abuse
router.post('/invoice', authenticate, sendInvoiceEmail);

export default router;
