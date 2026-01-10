import express from 'express';
import { authenticate, authenticateAdmin } from '../middleware/auth.js';
import { linkWallet, walletChallenge, recordCryptoPurchase, syncProject, getCertificateMetadata, listMyCertificates, prepareCertificateMetadata, grantFiatOffset } from '../controllers/blockchainUser.controller.js';
import { validateRecordPurchase } from '../middleware/validation.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const router = express.Router();

function handleValidation(req, res, next){
	const errors = validationResult(req);
	if(!errors.isEmpty()) return res.status(400).json({ success:false, errors: errors.array() });
	next();
}

// Wallet linking (challenge + signature)
router.get('/wallet/challenge', authenticate, walletChallenge);
router.post('/wallet/link', authenticate, linkWallet);
router.post('/projects/:projectMongoId/record-purchase', authenticate, validateRecordPurchase, handleValidation, recordCryptoPurchase);
router.post('/projects/:projectMongoId/grant-fiat', authenticateAdmin, grantFiatOffset);
router.post('/projects/:projectMongoId/sync', authenticateAdmin, syncProject);
router.get('/certificates/:tokenId', authenticate, getCertificateMetadata);
router.get('/certificates', authenticate, listMyCertificates);
// Limit metadata preparation to prevent abuse (10 per 5 minutes per IP)
const prepareCertLimiter = rateLimit({ windowMs: 5*60*1000, max: 10, standardHeaders: true, legacyHeaders: false });
router.post('/certificates/prepare', authenticate, prepareCertLimiter, prepareCertificateMetadata);

export default router;
