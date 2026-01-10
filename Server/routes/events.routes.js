import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getEventModel } from '../models/Event.model.js';
import { getNearbyEvents } from '../controllers/events.controller.js';

const router = express.Router();

// Track joined events (in-memory): userId -> Set(eventId)
const userEventJoins = new Map();

// GET /api/events → list of upcoming events
router.get('/', async (req, res) => {
	try {
		const Event = await getEventModel();
		const list = await Event.find({}).sort({ date: 1, created_at: -1 });
		return res.json(list);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// GET /api/events/nearby → get nearby events with coordinates
router.get('/nearby', getNearbyEvents);

// GET /api/events/:id → full event details
router.get('/:id', async (req, res) => {
	try {
		const Event = await getEventModel();
		const event = await Event.findById(req.params.id);
		if (!event) return res.status(404).json({ error: 'Event not found' });
		return res.json(event);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// POST /api/events/join/:id → join event (auth required)
router.post('/join/:id', authenticate, async (req, res) => {
	try {
		const Event = await getEventModel();
		const event = await Event.findById(req.params.id);
		if (!event) return res.status(404).json({ error: 'Event not found' });

		const userId = String(req.user._id);
		if (!userEventJoins.has(userId)) userEventJoins.set(userId, new Set());
		const joined = userEventJoins.get(userId);

		if (joined.has(String(event._id))) {
			return res.status(409).json({ error: 'Already joined this event' });
		}

		joined.add(String(event._id));
		return res.status(200).json({ success: true, message: 'Joined event successfully' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

export default router;


