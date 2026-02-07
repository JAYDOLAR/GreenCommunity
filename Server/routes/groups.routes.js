import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { listGroups, joinGroup, leaveGroup } from '../controllers/groups.controller.js';

const router = express.Router();

// GET /api/groups → list of groups (with join status if authenticated)
router.get('/', optionalAuth, listGroups);

// GET /api/groups/:id → group details with members info
router.get('/:id', optionalAuth, async (req, res) => {
	try {
		const { getGroupModel } = await import('../models/Group.model.js');
		const Group = await getGroupModel();
		const group = await Group.findById(req.params.id);
		if (!group) return res.status(404).json({ error: 'Group not found' });

		// Check if user has joined (if authenticated)
		let joined = false;
		if (req.user) {
			const { getUserGroupModel } = await import('../models/UserGroup.model.js');
			const UserGroup = await getUserGroupModel();
			const existing = await UserGroup.findOne({ userId: req.user._id, groupId: req.params.id });
			joined = !!existing;
		}

		return res.json({ ...group.toObject(), joined });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// POST /api/groups/join/:id → join group (auth required, DB-backed)
router.post('/join/:id', authenticate, joinGroup);

// POST /api/groups/leave/:id → leave group (auth required, DB-backed)
router.post('/leave/:id', authenticate, leaveGroup);

export default router;


