import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Mail, Calendar, MapPin, Ticket, XCircle,
  UserCheck, Inbox, AlertCircle, RefreshCw, Clock,
} from 'lucide-react';
import { getMyRegistrations, cancelRegistration } from '../services/api';
import { RegistrationCardSkeleton } from '../components/SkeletonCard';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

function formatDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

export default function MyRegistrationsPage() {
  const [email, setEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRegistrations = useCallback(async (emailToFetch) => {
    if (!emailToFetch?.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyRegistrations(emailToFetch.trim());
      setRegistrations(data.data);
      setFetched(true);
    } catch {
      setError('Failed to fetch registrations. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(inputEmail.trim())) {
      toast.error('Please enter a valid email address.', {
        style: { background: 'rgba(15,23,42,0.95)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '0.75rem' },
      });
      return;
    }
    setEmail(inputEmail.trim());
    fetchRegistrations(inputEmail.trim());
  };

  const handleCancel = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await cancelRegistration(deleteTarget._id);
      setRegistrations(prev => prev.filter(r => r._id !== deleteTarget._id));
      toast.success('Registration cancelled successfully.', {
        style: { background: 'rgba(15,23,42,0.95)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '0.75rem' },
      });
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to cancel registration. Please try again.', {
        style: { background: 'rgba(15,23,42,0.95)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)', borderRadius: '0.75rem' },
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ paddingTop: '6rem', paddingBottom: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <div style={{
          position: 'absolute', top: '4rem', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}
        >
          <span style={{
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.25)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#22d3ee',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}>
            <UserCheck size={12} /> My Portal
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            color: '#f1f5f9',
          }}
        >
          Your <span style={{ background: 'linear-gradient(135deg, #22d3ee, #a78bfa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Registrations</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: '1rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 2.5rem', lineHeight: 1.65 }}
        >
          Enter your email to view and manage all your active event registrations.
        </motion.p>

        {/* Email Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSearch}
          style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
            <input
              id="email-search"
              type="email"
              placeholder="you@example.com"
              value={inputEmail}
              onChange={e => setInputEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem 0.875rem 2.75rem',
                borderRadius: '0.75rem',
                background: 'rgba(30,41,59,0.7)',
                border: '1.5px solid rgba(71,85,105,0.4)',
                color: '#e2e8f0',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={e => { e.target.style.borderColor = '#06b6d4'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(71,85,105,0.4)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              boxShadow: '0 4px 15px rgba(6,182,212,0.35)',
              padding: '0.875rem 1.5rem',
            }}
            disabled={loading}
          >
            {loading ? <><div className="spinner" /> Searching…</> : <><Search size={15} /> Search</>}
          </motion.button>
        </motion.form>

        {/* Quick-fill hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: '#334155' }}
        >
          Try the demo account:{' '}
          <button
            onClick={() => setInputEmail('Abhi.18@example.com')}
            style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
          >
            Abhi.18@example.com
          </button>
        </motion.p>
      </motion.section>

      {/* Results Section */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem', position: 'relative', zIndex: 1 }}>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '1rem 1.25rem', background: 'rgba(251,113,133,0.08)',
              border: '1px solid rgba(251,113,133,0.2)', borderRadius: '0.875rem',
              color: '#fb7185', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={15} /> {error}
          </motion.div>
        )}

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => <RegistrationCardSkeleton key={i} />)}
          </div>
        )}

        {/* Registration Cards */}
        {!loading && fetched && (
          <>
            {/* Stats banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '0.625rem',
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ticket size={16} color="#22d3ee" />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#475569' }}>Showing results for</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#7dd3fc' }}>{email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{
                  padding: '0.3rem 0.875rem',
                  borderRadius: '9999px',
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#34d399',
                }}>
                  {registrations.length} registration{registrations.length !== 1 ? 's' : ''}
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => fetchRegistrations(email)}
                  style={{ padding: '0.375rem 0.875rem', fontSize: '0.78rem', gap: '0.35rem' }}
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </motion.div>

            {registrations.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '5rem 2rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  borderRadius: '1.25rem',
                  background: 'rgba(15,23,42,0.4)',
                  border: '1px dashed rgba(71,85,105,0.3)',
                }}
              >
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'rgba(71,85,105,0.12)',
                  border: '1px solid rgba(71,85,105,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Inbox size={36} color="#475569" />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#e2e8f0' }}>
                  No registrations found
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '340px', lineHeight: 1.65 }}>
                  You haven't registered for any events with <strong style={{ color: '#7dd3fc' }}>{email}</strong> yet.
                  Head to the Events page to explore upcoming events!
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {registrations.map((reg, i) => {
                  const event = reg.event_id;
                  const past = event?.date ? isPast(event.date) : false;
                  return (
                    <motion.div
                      key={reg._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="glass-card"
                      style={{
                        marginBottom: '1rem',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1.25rem',
                        opacity: past ? 0.7 : 1,
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      {/* Left accent line */}
                      <div style={{
                        position: 'absolute',
                        left: 0, top: '1rem', bottom: '1rem',
                        width: '3px',
                        borderRadius: '0 3px 3px 0',
                        background: past
                          ? 'rgba(71,85,105,0.5)'
                          : 'linear-gradient(180deg, #7c3aed, #06b6d4)',
                      }} />

                      {/* Icon */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '0.75rem', flexShrink: 0,
                        background: past ? 'rgba(71,85,105,0.15)' : 'rgba(124,58,237,0.12)',
                        border: `1px solid ${past ? 'rgba(71,85,105,0.25)' : 'rgba(124,58,237,0.25)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: '0.75rem',
                      }}>
                        <Ticket size={20} color={past ? '#475569' : '#a78bfa'} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', lineHeight: 1.3 }}>
                                {event?.title || 'Unknown Event'}
                              </h3>
                              {past && (
                                <span style={{ padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600, background: 'rgba(71,85,105,0.2)', color: '#64748b', border: '1px solid rgba(71,85,105,0.3)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={9} /> Ended
                                </span>
                              )}
                              {reg.isAdmin && (
                                <span style={{ padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Admin
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginTop: '0.25rem' }}>
                              {event?.date && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#7dd3fc' }}>
                                  <Calendar size={12} />
                                  {formatDate(event.date)} · {formatTime(event.date)}
                                </span>
                              )}
                              {event?.location && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#86efac' }}>
                                  <MapPin size={12} />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.5rem' }}>
                              Registered on {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>

                          {!past && (
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              className="btn-danger"
                              onClick={() => setDeleteTarget(reg)}
                              style={{ flexShrink: 0 }}
                            >
                              <XCircle size={14} /> Cancel
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </>
        )}

        {/* Initial state - no search done yet */}
        {!loading && !fetched && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              borderRadius: '1.25rem',
              border: '1px dashed rgba(71,85,105,0.2)',
            }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={28} color="#0891b2" />
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>Enter your email address above to see your registrations</p>
          </motion.div>
        )}
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleCancel}
        loading={deleteLoading}
        title="Cancel Registration?"
        message={`Are you sure you want to cancel your spot for "${deleteTarget?.event_id?.title}"? This action cannot be undone.`}
        confirmText="Yes, Cancel It"
      />
    </>
  );
}
