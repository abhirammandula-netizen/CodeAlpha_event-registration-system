const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import route handlers
const eventRoutes        = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const adminRoutes        = require('./routes/admin');

// ── API Routes ───────────────────────────────────────────────
app.use('/api/events', eventRoutes);
app.use('/api', registrationRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Event Registration API is running.', timestamp: new Date().toISOString() });
});

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── DB Connect + Seed + Start ─────────────────────────────────
async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  try {
    // Try the configured MONGO_URI first (real MongoDB)
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅  MongoDB connected:', mongoUri);
  } catch (_err) {
    // Fall back to in-memory MongoDB (no installation needed)
    console.log('ℹ️   Local MongoDB not found — starting in-memory database…');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅  In-memory MongoDB started at:', mongoUri);

    // Auto-seed the in-memory database
    console.log('🌱  Auto-seeding database with demo data…');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`\n🚀  Server     →  http://localhost:${PORT}`);
    console.log(`📋  Health     →  http://localhost:${PORT}/api/health`);
    console.log(`📅  Events     →  http://localhost:${PORT}/api/events\n`);
  });
}

async function seedDatabase() {
  const Event        = require('./models/Event');
  const Registration = require('./models/Registration');
  const Admin        = require('./models/Admin');
  const bcrypt       = require('bcryptjs');

  await Event.deleteMany({});
  await Registration.deleteMany({});
  await Admin.deleteMany({});

  // Seed default organizer/admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await Admin.create({
    name: 'Event Organizer',
    email: 'admin@eventhub.com',
    password: hashedPassword,
    role: 'organizer',
  });

  const events = await Event.insertMany([
    {
      title: "TECNOVATE 2026 - CSE Department Engineer's Day",
      description:
        "Celebrate the spirit of engineering at TECNOVATE 2026, the flagship annual event of the CSE Department. This premier gathering brings together brilliant minds from across the nation to showcase cutting-edge innovations, compete in live coding challenges, present groundbreaking research papers, and engage in electrifying tech talks by industry veterans and academic leaders. From hackathons to project expos, TECNOVATE 2026 is where the future of technology is written.",
      date: new Date('2026-11-15T09:00:00.000Z'),
      location: 'CSE Auditorium, Main Campus, Block A',
      total_capacity: 500,
      category: 'Technology',
      tags: ['Engineering', 'CSE', 'Hackathon', 'Innovation', 'Tech Talks'],
    },
    {
      title: 'Convergence 2K26 - Climate & Green Tech Hackathon',
      description:
        "Convergence 2K26 is a 36-hour intensive hackathon challenging participants to engineer sustainable solutions for our planet's most pressing climate crises. Build projects in renewable energy optimization, carbon tracking, smart agriculture, ocean health monitoring, and more. Compete for a prize pool of ₹5 Lakhs, mentorship from leading green-tech entrepreneurs, and a chance to present your solution to top-tier venture capital firms invested in sustainable technology.",
      date: new Date('2026-12-05T08:00:00.000Z'),
      location: 'Innovation Hub, Technology Park, Hyderabad',
      total_capacity: 300,
      category: 'Hackathon',
      tags: ['Climate Tech', 'Green Energy', 'Sustainability', 'Hackathon', 'SDGs'],
    },
    {
      title: 'AI & Neuromorphic Computing Summit',
      description:
        "Step into the frontier of artificial intelligence at the AI & Neuromorphic Computing Summit. This exclusive two-day conference gathers world-renowned researchers, AI scientists, and neurotechnology pioneers to explore the convergence of brain-inspired computing architectures and modern deep learning. Sessions include live demos of neuromorphic chips, debates on AGI timelines, workshops on quantum-AI integration, and intimate roundtables on the ethics of sentient machines.",
      date: new Date('2026-12-20T10:00:00.000Z'),
      location: 'International Convention Centre, Bengaluru',
      total_capacity: 200,
      category: 'Summit',
      tags: ['Artificial Intelligence', 'Neuromorphic', 'Deep Learning', 'Research', 'Quantum AI'],
    },
  ]);

  // Register test user for first two events
  await Registration.insertMany([
    { user_name: 'Abhiram Mandula', user_email: 'abhi.18@example.com', event_id: events[0]._id },
    { user_name: 'Abhiram Mandula', user_email: 'abhi.18@example.com', event_id: events[1]._id },
  ]);

  console.log(`✅  Seeded ${events.length} events + 2 registrations for abhi.18@example.com`);
  console.log(`🔐  Seeded Admin Organizer: admin@eventhub.com / admin123`);
}

startServer().catch((err) => {
  console.error('❌  Failed to start server:', err.message);
  process.exit(1);
});
