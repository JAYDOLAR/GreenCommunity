import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { listChallenges, completeChallenge, getLeaderboard, getLeaderboardExtended, seedChallenges, getMe } from '../controllers/challenges.controller.js';

const router = express.Router();

router.get('/', optionalAuth, listChallenges);
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/extended', getLeaderboardExtended);
router.post('/complete/:id', authenticate, completeChallenge);
router.post('/seed', seedChallenges);
router.get('/me', authenticate, getMe);

export default router;


