import { getEventModel } from '../models/Event.model.js';
import { getUserEventModel } from '../models/UserEvent.model.js';
import mongoose from 'mongoose';

export const listEvents = async (req, res) => {
  try {
    const Event = await getEventModel();
    const events = await Event.find().sort({ date: 1 });
    
    // Include join info if authenticated
    try {
      const userId = req.user?._id;
      if (userId) {
        const UserEvent = await getUserEventModel();
        const joined = await UserEvent.find({ userId }).select('eventId');
        const joinedSet = new Set(joined.map(j => String(j.eventId)));
        
        return res.json(events.map(e => ({ 
          ...e.toObject(), 
          joined: joinedSet.has(String(e._id)) 
        })));
      }
    } catch (err) {
      console.error('Error getting joined events:', err);
    }
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format with more detailed error
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid event ID format: ${id}`);
      return res.status(400).json({ 
        error: 'Invalid event ID format',
        details: `The provided ID "${id}" is not a valid MongoDB ObjectId`
      });
    }
    
    const userId = req.user._id;
    const Event = await getEventModel();
    const UserEvent = await getUserEventModel();
    
    // Check if user has already joined
    const existingJoin = await UserEvent.findOne({ userId, eventId: id });
    if (existingJoin) {
      return res.status(409).json({ error: 'Already joined this event' });
    }
    
    // Find the event first to check capacity
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if the event is at capacity
    if (event.attendees >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is at capacity' });
    }
    
    // Update the event attendees count
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $inc: { attendees: 1 } },
      { new: true }
    );
    
    // Record the join
    await UserEvent.create({ userId, eventId: id });
    
    res.json({ success: true, event: { ...updatedEvent.toObject(), joined: true } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format with more detailed error
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid event ID format: ${id}`);
      return res.status(400).json({ 
        error: 'Invalid event ID format',
        details: `The provided ID "${id}" is not a valid MongoDB ObjectId`
      });
    }
    
    const userId = req.user._id;
    const Event = await getEventModel();
    const UserEvent = await getUserEventModel();
    
    // Check if user has joined
    const existingJoin = await UserEvent.findOne({ userId, eventId: id });
    if (!existingJoin) {
      return res.status(404).json({ error: 'Not attending this event' });
    }
    
    // Update the event attendees count (ensure it doesn't go below 0)
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $inc: { attendees: -1 } },
      { new: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Remove the join record
    await UserEvent.deleteOne({ userId, eventId: id });
    
    res.json({ success: true, event: { ...updatedEvent.toObject(), joined: false } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
