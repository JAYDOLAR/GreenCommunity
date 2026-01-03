import express from 'express';
import { ask, generateTips, chatDeprecated } from '../controllers/ai.controller.js';
import { moderatePrompt } from '../middleware/moderation.js';

const router = express.Router();

router.post('/ask', moderatePrompt, ask);
router.post('/generate-tips', generateTips);
router.all('/chat', chatDeprecated);

export default router;


