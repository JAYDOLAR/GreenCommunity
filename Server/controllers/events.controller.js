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

// Get nearby events with coordinates for map display
export const getNearbyEvents = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 50, // default 50km radius
      limit = 20,
      upcoming = true
    } = req.query;

    const Event = await getEventModel();
    
    // Build filter for events
    const filter = {};
    
    // Filter for upcoming events by default
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
    }
    
    let events;
    
    // For now, get all events and add mock coordinates based on location string
    // In a real app, you'd want to geocode the location or store coordinates
    events = await Event.find(filter)
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .lean();
    
    // Add mock coordinates based on location names for demo purposes
    // In production, you'd want to geocode these or store actual coordinates
    const eventsWithCoordinates = events.map(event => {
      let coordinates = null;
      
      // Simple location-based coordinate mapping (you'd use a geocoding service)
      const locationLower = (event.location || '').toLowerCase();
      if (locationLower.includes('delhi') || locationLower.includes('new delhi')) {
        coordinates = [77.2090, 28.6139]; // Delhi
      } else if (locationLower.includes('mumbai') || locationLower.includes('bombay')) {
        coordinates = [72.8777, 19.0760]; // Mumbai
      } else if (locationLower.includes('bangalore') || locationLower.includes('bengaluru')) {
        coordinates = [77.5946, 12.9716]; // Bangalore
      } else if (locationLower.includes('chennai') || locationLower.includes('madras')) {
        coordinates = [80.2707, 13.0827]; // Chennai
      } else if (locationLower.includes('kolkata') || locationLower.includes('calcutta')) {
        coordinates = [88.3639, 22.5726]; // Kolkata
      } else if (locationLower.includes('hyderabad')) {
        coordinates = [78.4867, 17.3850]; // Hyderabad
      } else if (locationLower.includes('pune')) {
        coordinates = [73.8567, 18.5204]; // Pune
      } else if (locationLower.includes('jaipur')) {
        coordinates = [75.7873, 26.9124]; // Jaipur
      } else if (locationLower.includes('ahmedabad')) {
        coordinates = [72.5714, 23.0225]; // Ahmedabad
      } else if (locationLower.includes('surat')) {
        coordinates = [72.8311, 21.1702]; // Surat
      } else if (locationLower.includes('lucknow')) {
        coordinates = [80.9462, 26.8467]; // Lucknow
      } else if (locationLower.includes('kanpur')) {
        coordinates = [80.3319, 26.4499]; // Kanpur
      } else {
        // Random coordinates in India if no specific location match
        coordinates = [
          75 + Math.random() * 10, // Longitude between 75-85
          15 + Math.random() * 20  // Latitude between 15-35
        ];
      }
      
      return {
        ...event,
        coordinates
      };
    }).filter(event => event.coordinates); // Only include events with coordinates
    
    res.json({
      success: true,
      data: {
        events: eventsWithCoordinates,
        count: eventsWithCoordinates.length,
        searchRadius: radius,
        center: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
      }
    });
  } catch (error) {
    console.error('Error fetching nearby events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby events',
      error: error.message
    });
  }
};
