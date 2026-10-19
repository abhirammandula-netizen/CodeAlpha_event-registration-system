const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./models/Event');
const Registration = require('./models/Registration');

const events = [
  {
    title: 'TECNOVATE 2026 - CSE Department Engineer\'s Day',
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
      'Convergence 2K26 is a 36-hour intensive hackathon challenging participants to engineer sustainable solutions for our planet\'s most pressing climate crises. Build projects in renewable energy optimization, carbon tracking, smart agriculture, ocean health monitoring, and more. Compete for a prize pool of ₹5 Lakhs, mentorship from leading green-tech entrepreneurs, and a chance to present your solution to top-tier venture capital firms invested in sustainable technology.',
    date: new Date('2026-12-05T08:00:00.000Z'),
    location: 'Innovation Hub, Technology Park, Hyderabad',
    total_capacity: 300,
    category: 'Hackathon',
    tags: ['Climate Tech', 'Green Energy', 'Sustainability', 'Hackathon', 'SDGs'],
  },
  {
    title: 'AI & Neuromorphic Computing Summit',
    description:
      'Step into the frontier of artificial intelligence at the AI & Neuromorphic Computing Summit. This exclusive two-day conference gathers world-renowned researchers, AI scientists, and neurotechnology pioneers to explore the convergence of brain-inspired computing architectures and modern deep learning. Sessions include live demos of neuromorphic chips, debates on AGI timelines, workshops on quantum-AI integration, and intimate roundtables on the ethics of sentient machines.',
    date: new Date('2026-12-20T10:00:00.000Z'),
    location: 'International Convention Centre, Bengaluru',
    total_capacity: 200,
    category: 'Summit',
    tags: ['Artificial Intelligence', 'Neuromorphic', 'Deep Learning', 'Research', 'Quantum AI'],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await Event.deleteMany({});
    await Registration.deleteMany({});
    console.log('🗑️  Cleared existing events and registrations.');

    // Insert events
    const createdEvents = await Event.insertMany(events);
    console.log(`🌱 Seeded ${createdEvents.length} events.`);

    // Create default test user registrations
    const testUser = {
      user_name: 'Abhiram Mandula',
      user_email: 'abhi.18@example.com',
    };

    // Register test user for the first two events
    const registrations = [
      { ...testUser, event_id: createdEvents[0]._id },
      { ...testUser, event_id: createdEvents[1]._id },
    ];

    await Registration.insertMany(registrations);
    console.log(`👤 Created ${registrations.length} registrations for test user: ${testUser.user_email}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────────');
    createdEvents.forEach((e, i) => {
      console.log(`  Event ${i + 1}: ${e.title}`);
      console.log(`    ID: ${e._id}`);
    });
    console.log('─────────────────────────────────────────');
    console.log(`  Test user email: ${testUser.user_email}`);
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
