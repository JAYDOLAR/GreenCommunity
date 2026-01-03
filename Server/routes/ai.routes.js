import express from 'express';
import { ask, generateTips, chatDeprecated } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/ask', ask);
router.post('/generate-tips', generateTips);
router.all('/chat', chatDeprecated);

export default router;


