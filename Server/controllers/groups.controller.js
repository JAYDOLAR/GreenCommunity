import { getGroupModel } from '../models/Group.model.js';
import { getUserGroupModel } from '../models/UserGroup.model.js';
import mongoose from 'mongoose';

export const listGroups = async (req, res) => {
  try {
    const Group = await getGroupModel();
    const groups = await Group.find().sort({ members: -1 });
    
    // Include join info if authenticated
    try {
      const userId = req.user?._id;
      if (userId) {
        const UserGroup = await getUserGroupModel();
        const joined = await UserGroup.find({ userId }).select('groupId');
        const joinedSet = new Set(joined.map(j => String(j.groupId)));
        
        return res.json(groups.map(g => ({ 
          ...g.toObject(), 
          joined: joinedSet.has(String(g._id)) 
        })));
      }
    } catch (err) {
      console.error('Error getting joined groups:', err);
    }
    
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format with more detailed error
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid group ID format: ${id}`);
      return res.status(400).json({ 
        error: 'Invalid group ID format',
        details: `The provided ID "${id}" is not a valid MongoDB ObjectId`
      });
    }
    
    const userId = req.user._id;
    const Group = await getGroupModel();
    const UserGroup = await getUserGroupModel();
    
    // Check if user has already joined
    const existingJoin = await UserGroup.findOne({ userId, groupId: id });
    if (existingJoin) {
      return res.status(409).json({ error: 'Already joined this group' });
    }
    
    // Find and update the group with atomic increment of members
    const group = await Group.findByIdAndUpdate(
      id,
      { $inc: { members: 1 } },
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Record the join
    await UserGroup.create({ userId, groupId: id });
    
    res.json({ success: true, group: { ...group.toObject(), joined: true } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format with more detailed error
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid group ID format: ${id}`);
      return res.status(400).json({ 
        error: 'Invalid group ID format',
        details: `The provided ID "${id}" is not a valid MongoDB ObjectId`
      });
    }
    
    const userId = req.user._id;
    const Group = await getGroupModel();
    const UserGroup = await getUserGroupModel();
    
    // Check if user has joined
    const existingJoin = await UserGroup.findOne({ userId, groupId: id });
    if (!existingJoin) {
      return res.status(404).json({ error: 'Not a member of this group' });
    }
    
    // Find and update the group with atomic decrement of members
    const group = await Group.findByIdAndUpdate(
      id,
      { $inc: { members: -1 } }, // Ensure members doesn't go below 0
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Remove the join record
    await UserGroup.deleteOne({ userId, groupId: id });
    
    res.json({ success: true, group: { ...group.toObject(), joined: false } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
