import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';

const router = Router();

// POST /api/payment/create-order
router.post('/create-order', createOrder);

// POST /api/payment/verify
router.post('/verify', verifyPayment);

export default router;
