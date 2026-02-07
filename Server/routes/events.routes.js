import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { listEvents, joinEvent, leaveEvent, getNearbyEvents } from '../controllers/events.controller.js';

const router = express.Router();

// GET /api/events → list of upcoming events (with join status if authenticated)
router.get('/', optionalAuth, listEvents);

// GET /api/events/nearby → get nearby events with coordinates
router.get('/nearby', getNearbyEvents);

// GET /api/events/:id → full event details
router.get('/:id', optionalAuth, async (req, res) => {
	try {
		const { getEventModel } = await import('../models/Event.model.js');
		const Event = await getEventModel();
		const event = await Event.findById(req.params.id);
		if (!event) return res.status(404).json({ error: 'Event not found' });

		// Check if user has joined (if authenticated)
		let joined = false;
		if (req.user) {
			const { getUserEventModel } = await import('../models/UserEvent.model.js');
			const UserEvent = await getUserEventModel();
			const existing = await UserEvent.findOne({ userId: req.user._id, eventId: req.params.id });
			joined = !!existing;
		}

		return res.json({ ...event.toObject(), joined });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// POST /api/events/join/:id → join event (auth required, DB-backed)
router.post('/join/:id', authenticate, joinEvent);

// POST /api/events/leave/:id → leave event (auth required, DB-backed)
router.post('/leave/:id', authenticate, leaveEvent);

export default router;


