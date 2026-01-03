import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { listChallenges, completeChallenge, getLeaderboard, seedChallenges, getMe } from '../controllers/challenges.controller.js';

const router = express.Router();

router.get('/', listChallenges);
router.get('/leaderboard', getLeaderboard);
router.post('/complete/:id', authenticate, completeChallenge);
router.post('/seed', seedChallenges);
router.get('/me', authenticate, getMe);

export default router;


