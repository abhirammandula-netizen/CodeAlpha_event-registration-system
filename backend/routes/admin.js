const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const authMiddleware = require('../middleware/auth');
const { JWT_SECRET } = require('../middleware/auth');

// ── Organizer/Admin Login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ── Get Current Organizer Profile ──────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
});

// ── Dashboard Statistics ──────────────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    const events = await Event.find();
    const totalCapacity = events.reduce((sum, e) => sum + (e.total_capacity || 0), 0);
    const capacityFilledPct = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalRegistrations,
        totalCapacity,
        capacityFilledPct,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
});

// ── Get All Registrations Across All Events ────────────────────────
router.get('/registrations', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('event_id', 'title date location category')
      .sort({ registration_date: -1 });

    res.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve registrations.' });
  }
});

// ── Admin Delete/Cancel a Registration ─────────────────────────────
router.delete('/registrations/:id', authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    res.json({ success: true, message: 'Registration successfully removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete registration.' });
  }
});

// ── Admin Create Event ─────────────────────────────────────────────
router.post('/events', authMiddleware, async (req, res) => {
  try {
    const { title, description, date, location, total_capacity, category, tags } = req.body;

    if (!title || !description || !date || !location || !total_capacity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required event fields (title, description, date, location, total_capacity).',
      });
    }

    const event = new Event({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      location: location.trim(),
      total_capacity: Number(total_capacity),
      category: category ? category.trim() : 'General',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event,
    });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

// ── Admin Update Event ─────────────────────────────────────────────
router.put('/events/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, date, location, total_capacity, category, tags } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (date) event.date = new Date(date);
    if (location) event.location = location.trim();
    if (total_capacity) event.total_capacity = Number(total_capacity);
    if (category) event.category = category.trim();
    if (tags) {
      event.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    }

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
});

// ── Admin Delete Event ─────────────────────────────────────────────
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Also remove associated registrations
    await Registration.deleteMany({ event_id: req.params.id });

    res.json({
      success: true,
      message: 'Event and associated registrations deleted successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

module.exports = router;
