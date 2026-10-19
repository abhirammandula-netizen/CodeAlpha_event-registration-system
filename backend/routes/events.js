const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// GET /api/events - Get all events with registration counts
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    // Attach registration count to each event
    const eventsWithCount = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event_id: event._id,
        });
        return {
          ...event.toObject(),
          registered_count: registrationCount,
          spots_remaining: event.total_capacity - registrationCount,
        };
      })
    );

    res.json({ success: true, data: eventsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/:id - Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const registrationCount = await Registration.countDocuments({
      event_id: event._id,
    });

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        registered_count: registrationCount,
        spots_remaining: event.total_capacity - registrationCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
