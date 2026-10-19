const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// ── POST /api/register ──────────────────────────────────────
// Register a user for an event
router.post('/register', async (req, res) => {
  try {
    const { user_name, user_email, event_id, isAdmin } = req.body;

    if (!user_name || !user_email || !event_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and event ID are required.',
      });
    }

    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const registrationCount = await Registration.countDocuments({ event_id });
    if (registrationCount >= event.total_capacity) {
      return res.status(400).json({
        success: false,
        message: 'This event is fully booked. No spots remaining.',
      });
    }

    const registration = await Registration.create({
      user_name,
      user_email,
      event_id,
      isAdmin: isAdmin || false,
    });

    const populated = await registration.populate('event_id');

    res.status(201).json({
      success: true,
      message: 'Registration successful! You are now registered for this event.',
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/my-registrations?email=... ─────────────────────
// Get all registrations for a user by email
router.get('/my-registrations', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email query parameter is required.',
      });
    }

    const registrations = await Registration.find({
      user_email: email.toLowerCase(),
    })
      .populate('event_id')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── DELETE /api/registrations/:id ───────────────────────────
// Cancel (delete) a registration
router.delete('/registrations/:id', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    res.json({
      success: true,
      message: 'Registration cancelled successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
