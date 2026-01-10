import express from 'express';
import { sendInvoiceEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.post('/invoice', sendInvoiceEmail);

export default router;
