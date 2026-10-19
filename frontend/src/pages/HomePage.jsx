import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, CalendarDays, Sparkles } from 'lucide-react';
import EventCard from '../components/EventCard';
import { EventCardSkeleton } from '../components/SkeletonCard';
import RegistrationModal from '../components/RegistrationModal';
import { getEvents } from '../services/api';

const CATEGORIES = ['All', 'Technology', 'Hackathon', 'Summit', 'General'];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getEvents();
      setEvents(data.data);
    } catch {
      setError('Failed to load events. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    let result = events;
    if (activeCategory !== 'All') {
      result = result.filter(e => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [events, search, activeCategory]);

  const handleRegistrationSuccess = () => {
    fetchEvents(); // Refresh to update capacity counts
  };

  return (
    <>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ paddingTop: '6rem', paddingBottom: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '4rem', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          <span style={{
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#a78bfa',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}>
            <Sparkles size={12} /> Discover Upcoming Events
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ color: '#f1f5f9' }}>Your Next Big </span>
          <span className="gradient-text-violet">Experience</span>
          <br />
          <span style={{ color: '#f1f5f9' }}>Starts </span>
          <span className="gradient-text-gold">Here.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}
        >
          Explore and register for premier tech events, hackathons, and summits.
          Reserve your spot with a single click.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ maxWidth: '520px', margin: '0 auto', position: 'relative' }}
        >
          <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
          <input
            id="event-search"
            type="text"
            placeholder="Search events, topics, locations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem 1.25rem 0.9rem 3rem',
              borderRadius: '0.875rem',
              background: 'rgba(30,41,59,0.7)',
              border: '1.5px solid rgba(71,85,105,0.4)',
              color: '#e2e8f0',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#7c3aed';
              e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(71,85,105,0.4)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </motion.div>
      </motion.section>

      {/* Content Section */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 4rem', position: 'relative', zIndex: 1 }}>
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '2.5rem', alignItems: 'center' }}
        >
          <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem', marginRight: '0.25rem' }}>
            <SlidersHorizontal size={13} /> Filter:
          </span>
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                transition: 'all 0.2s ease',
                background: activeCategory === cat ? 'rgba(124,58,237,0.2)' : 'rgba(30,41,59,0.6)',
                borderColor: activeCategory === cat ? 'rgba(124,58,237,0.5)' : 'rgba(71,85,105,0.3)',
                color: activeCategory === cat ? '#a78bfa' : '#64748b',
                boxShadow: activeCategory === cat ? '0 0 15px rgba(124,58,237,0.15)' : 'none',
              }}
            >
              {cat}
            </motion.button>
          ))}

          {!loading && (
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#475569' }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            </span>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '1.5rem',
              background: 'rgba(251,113,133,0.08)',
              border: '1px solid rgba(251,113,133,0.25)',
              borderRadius: '1rem',
              color: '#fb7185',
              textAlign: 'center',
              marginBottom: '2rem',
              fontSize: '0.9rem',
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => <EventCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '50%',
              background: 'rgba(71,85,105,0.15)',
              border: '1px solid rgba(71,85,105,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '0.5rem',
            }}>
              <CalendarDays size={36} color="#475569" />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.3rem', color: '#e2e8f0' }}>
              No events found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '360px', lineHeight: 1.6 }}>
              {search || activeCategory !== 'All'
                ? 'Try adjusting your search or clearing filters to see all events.'
                : 'No upcoming events at the moment. Check back soon!'}
            </p>
            {(search || activeCategory !== 'All') && (
              <button
                className="btn-ghost"
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                style={{ marginTop: '0.5rem' }}
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((event, i) => (
              <EventCard
                key={event._id}
                event={event}
                index={i}
                onRegister={setSelectedEvent}
              />
            ))}
          </div>
        )}
      </main>

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <RegistrationModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
