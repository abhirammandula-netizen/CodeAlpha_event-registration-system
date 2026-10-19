import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, ArrowRight, Zap } from 'lucide-react';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const CATEGORY_STYLES = {
  Technology: { cls: 'cat-technology', icon: '⚡' },
  Hackathon:  { cls: 'cat-hackathon',  icon: '🌊' },
  Summit:     { cls: 'cat-summit',     icon: '🔮' },
  General:    { cls: 'cat-general',    icon: '📅' },
};

const CAPACITY_COLORS = {
  low:    'linear-gradient(90deg, #10b981, #34d399)',
  medium: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
  high:   'linear-gradient(90deg, #f43f5e, #fb7185)',
};

export default function EventCard({ event, onRegister, index }) {
  const pct = event.total_capacity > 0
    ? (event.registered_count / event.total_capacity) * 100
    : 0;
  const isFull = event.spots_remaining <= 0;
  const catStyle = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.General;

  const barColor = pct < 60
    ? CAPACITY_COLORS.low
    : pct < 85
    ? CAPACITY_COLORS.medium
    : CAPACITY_COLORS.high;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card glass-card-hover"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* Color band at top */}
      <div style={{
        height: '3px',
        background: pct < 60
          ? 'linear-gradient(90deg, #10b981, #8b5cf6)'
          : pct < 85
          ? 'linear-gradient(90deg, #f59e0b, #f43f5e)'
          : 'linear-gradient(90deg, #f43f5e, #fb7185)',
        borderRadius: '1.25rem 1.25rem 0 0',
      }} />

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {/* Header: Category + Full badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={`tag-badge ${catStyle.cls}`}>
            {catStyle.icon} {event.category}
          </span>
          {isFull && (
            <span style={{
              padding: '0.2rem 0.7rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'rgba(244,63,94,0.15)',
              color: '#fb7185',
              border: '1px solid rgba(244,63,94,0.3)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              SOLD OUT
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: '1.1rem',
          lineHeight: 1.35,
          color: '#f1f5f9',
          letterSpacing: '-0.01em',
        }}>
          {event.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '0.85rem',
          lineHeight: 1.65,
          color: '#64748b',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {event.description}
        </p>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {event.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: 500,
                background: 'rgba(51,65,85,0.7)',
                color: '#94a3b8',
                border: '1px solid rgba(71,85,105,0.4)',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(71,85,105,0.25)' }} />

        {/* Date & Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7dd3fc', fontSize: '0.82rem' }}>
            <Calendar size={13} />
            <span>{formatDate(event.date)} &bull; {formatTime(event.date)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#86efac', fontSize: '0.82rem' }}>
            <MapPin size={13} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </span>
          </div>
        </div>

        {/* Capacity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.77rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={12} />
              {event.registered_count} / {event.total_capacity} registered
            </span>
            <span style={{ fontSize: '0.77rem', fontWeight: 600, color: isFull ? '#fb7185' : '#34d399' }}>
              {isFull ? 'Full' : `${event.spots_remaining} left`}
            </span>
          </div>
          <div className="capacity-bar">
            <div
              className="capacity-fill"
              style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
            />
          </div>
        </div>

        {/* Register Button */}
        <motion.button
          whileHover={{ scale: isFull ? 1 : 1.02 }}
          whileTap={{ scale: isFull ? 1 : 0.97 }}
          className="btn-primary"
          style={{
            width: '100%',
            marginTop: 'auto',
            ...(isFull ? {
              background: 'rgba(71,85,105,0.4)',
              boxShadow: 'none',
              cursor: 'not-allowed',
              color: '#64748b',
            } : {}),
          }}
          onClick={() => !isFull && onRegister(event)}
          disabled={isFull}
        >
          {isFull ? (
            <>Event Full</>
          ) : (
            <>
              Register Now
              <ArrowRight size={15} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
