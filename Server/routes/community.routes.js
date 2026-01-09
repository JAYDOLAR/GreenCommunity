import express from 'express';
import { listGroups, joinGroup, leaveGroup } from '../controllers/groups.controller.js';
import { listEvents, joinEvent, leaveEvent } from '../controllers/events.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Group routes
router.get('/groups', optionalAuth, listGroups);
router.post('/groups/join/:id', authenticate, joinGroup);
router.post('/groups/leave/:id', authenticate, leaveGroup);

// Event routes
router.get('/events', optionalAuth, listEvents);
router.post('/events/join/:id', authenticate, joinEvent);
router.post('/events/leave/:id', authenticate, leaveEvent);

export default router;
