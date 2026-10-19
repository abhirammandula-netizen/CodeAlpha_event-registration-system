import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, MapPin, Calendar, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { registerForEvent } from '../services/api';
import toast from 'react-hot-toast';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RegistrationModal({ event, onClose, onSuccess }) {
  const [form, setForm] = useState({ user_name: '', user_email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!form.user_name.trim()) errs.user_name = 'Full name is required';
    else if (form.user_name.trim().length < 2) errs.user_name = 'Name must be at least 2 characters';
    if (!form.user_email.trim()) errs.user_email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.user_email)) errs.user_email = 'Enter a valid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registerForEvent({ ...form, event_id: event._id });
      setSuccess(true);
      toast.success('Registration successful! 🎉', {
        style: {
          background: 'rgba(15,23,42,0.95)',
          color: '#34d399',
          border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: '0.75rem',
        },
      });
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg, {
        style: {
          background: 'rgba(15,23,42,0.95)',
          color: '#fb7185',
          border: '1px solid rgba(251,113,133,0.3)',
          borderRadius: '0.75rem',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            width: '100%',
            maxWidth: '520px',
            background: 'rgba(15, 23, 42, 0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '1.5rem',
            boxShadow: '0 0 60px rgba(139,92,246,0.15), 0 40px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* Top gradient bar */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }} />

          {/* Header */}
          <div style={{ padding: '1.5rem 1.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                Register for Event
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Secure your spot before it fills up</p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(71,85,105,0.5)',
                background: 'rgba(30,41,59,0.8)', color: '#94a3b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.15)'; e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.8)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(71,85,105,0.5)'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Event info card */}
          <div style={{
            margin: '0 1.75rem',
            padding: '1rem 1.25rem',
            background: 'rgba(30,41,59,0.7)',
            border: '1px solid rgba(71,85,105,0.3)',
            borderRadius: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.3 }}>
              {event.title}
            </h3>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#7dd3fc' }}>
                <Calendar size={12} /> {formatDate(event.date)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#86efac' }}>
                <MapPin size={12} /> {event.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', color: '#c4b5fd' }}>
                <Users size={12} /> {event.spots_remaining} spots remaining
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ padding: '2.5rem 1.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'rgba(52,211,153,0.15)',
                    border: '2px solid rgba(52,211,153,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(52,211,153,0.2)',
                  }}
                >
                  <CheckCircle2 size={36} color="#34d399" />
                </motion.div>
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>
                    You're registered! 🎉
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                    Successfully registered as <strong style={{ color: '#a78bfa' }}>{form.user_name}</strong>.<br />
                    A confirmation has been linked to <strong style={{ color: '#7dd3fc' }}>{form.user_email}</strong>.
                  </p>
                </div>
                <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={onClose}>
                  Done
                </button>
              </motion.div>
            ) : (
              /* Form State */
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                style={{ padding: '1.5rem 1.75rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Name Field */}
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="user_name"
                    id="modal-user-name"
                    className={`floating-input ${errors.user_name ? 'error' : ''}`}
                    placeholder="Full Name"
                    value={form.user_name}
                    onChange={handleChange}
                    autoComplete="name"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                  <label htmlFor="modal-user-name" className="floating-label" style={{ left: '2.75rem' }}>
                    Full Name
                  </label>
                  <User size={15} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#475569', pointerEvents: 'none' }} />
                  {errors.user_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <AlertCircle size={11} /> {errors.user_name}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="user_email"
                    id="modal-user-email"
                    className={`floating-input ${errors.user_email ? 'error' : ''}`}
                    placeholder="Email Address"
                    value={form.user_email}
                    onChange={handleChange}
                    autoComplete="email"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                  <label htmlFor="modal-user-email" className="floating-label" style={{ left: '2.75rem' }}>
                    Email Address
                  </label>
                  <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#475569', pointerEvents: 'none' }} />
                  {errors.user_email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ fontSize: '0.75rem', color: '#fb7185', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <AlertCircle size={11} /> {errors.user_email}
                    </motion.p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', marginTop: '0.25rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="spinner" /> Registering...</>
                  ) : (
                    <>Confirm Registration</>
                  )}
                </motion.button>

                <p style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                  By registering, you confirm your intent to attend. Cancellations can be made from "My Registrations".
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
