import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getGroupModel } from '../models/Group.model.js';

const router = express.Router();

// Simple joined tracking in-memory: userId -> Set(groupId)
const userGroupJoins = new Map();

// GET /api/groups → list of groups
router.get('/', async (req, res) => {
	try {
		const Group = await getGroupModel();
		const list = await Group.find({}).sort({ created_at: -1 });
		return res.json(list);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// GET /api/groups/:id → group details + dummy members list
router.get('/:id', async (req, res) => {
	try {
		const Group = await getGroupModel();
		const group = await Group.findById(req.params.id);
		if (!group) return res.status(404).json({ error: 'Group not found' });

		// dummy members (until DB relationship exists)
		const members = Array.from({ length: Math.min(group.members || 0, 10) }, (_, i) => ({
			name: `Member ${i + 1}`,
			avatar: 'https://placehold.co/32x32'
		}));

		return res.json({ ...group.toObject(), members });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// POST /api/groups/join/:id → join group (auth required)
router.post('/join/:id', authenticate, async (req, res) => {
	try {
		const Group = await getGroupModel();
		const group = await Group.findById(req.params.id);
		if (!group) return res.status(404).json({ error: 'Group not found' });

		const userId = String(req.user._id);
		if (!userGroupJoins.has(userId)) userGroupJoins.set(userId, new Set());
		const joined = userGroupJoins.get(userId);

		if (joined.has(String(group._id))) {
			return res.status(409).json({ error: 'Already joined this group' });
		}

		joined.add(String(group._id));
		return res.status(200).json({ success: true, message: 'Joined group successfully' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

export default router;


