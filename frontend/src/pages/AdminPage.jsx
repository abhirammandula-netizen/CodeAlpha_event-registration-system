import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  Plus,
  Trash2,
  Edit3,
  Users,
  Calendar,
  Layers,
  Sparkles,
  LogOut,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminLogin,
  getAdminStats,
  getAdminRegistrations,
  deleteAdminRegistration,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  getEvents,
} from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('eventhub_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('eventhub_admin_user')) || null;
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'registrations'
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Event modal state (create / edit)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Technology',
    date: '',
    location: '',
    total_capacity: 100,
    tags: '',
    description: '',
  });
  const [savingEvent, setSavingEvent] = useState(false);

  // Confirm delete dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    onConfirm: () => {},
  });

  // Load dashboard data when authenticated
  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [eventsRes, statsRes, regsRes] = await Promise.all([
        getEvents(),
        getAdminStats(),
        getAdminRegistrations(),
      ]);
      setEvents(eventsRes.data.data || eventsRes.data.events || []);
      setStats(statsRes.data.stats || null);
      setRegistrations(regsRes.data.registrations || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to load organizer dashboard data.');
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await adminLogin({ email: loginEmail, password: loginPassword });
      const { token: receivedToken, admin } = res.data;
      localStorage.setItem('eventhub_admin_token', receivedToken);
      localStorage.setItem('eventhub_admin_user', JSON.stringify(admin));
      setToken(receivedToken);
      setAdminUser(admin);
      toast.success(`Welcome back, ${admin.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setLoginEmail('admin@eventhub.com');
    setLoginPassword('admin123');
    setTimeout(() => {
      adminLogin({ email: 'admin@eventhub.com', password: 'admin123' })
        .then((res) => {
          const { token: receivedToken, admin } = res.data;
          localStorage.setItem('eventhub_admin_token', receivedToken);
          localStorage.setItem('eventhub_admin_user', JSON.stringify(admin));
          setToken(receivedToken);
          setAdminUser(admin);
          toast.success(`Logged in as Demo Organizer!`);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Failed to auto-login.');
        });
    }, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem('eventhub_admin_token');
    localStorage.removeItem('eventhub_admin_user');
    setToken('');
    setAdminUser(null);
    toast.success('Logged out successfully.');
  };

  // Open modal to create event
  const openCreateModal = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      category: 'Technology',
      date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      location: '',
      total_capacity: 150,
      tags: '',
      description: '',
    });
    setIsEventModalOpen(true);
  };

  // Open modal to edit event
  const openEditModal = (event) => {
    setEditingEventId(event._id);
    const dateStr = event.date ? new Date(event.date).toISOString().slice(0, 16) : '';
    setEventForm({
      title: event.title || '',
      category: event.category || 'Technology',
      date: dateStr,
      location: event.location || '',
      total_capacity: event.total_capacity || 100,
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : '',
      description: event.description || '',
    });
    setIsEventModalOpen(true);
  };

  // Save (Create or Update) event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.location.trim()) {
      toast.error('Please fill in all required event details.');
      return;
    }

    setSavingEvent(true);
    try {
      const payload = {
        title: eventForm.title,
        category: eventForm.category,
        date: new Date(eventForm.date).toISOString(),
        location: eventForm.location,
        total_capacity: Number(eventForm.total_capacity),
        tags: eventForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        description: eventForm.description,
      };

      if (editingEventId) {
        await updateAdminEvent(editingEventId, payload);
        toast.success('Event updated successfully!');
      } else {
        await createAdminEvent(payload);
        toast.success('Event created and published!');
      }

      setIsEventModalOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSavingEvent(false);
    }
  };

  // Confirm and delete event
  const handleDeleteEventClick = (event) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete "${event.title}"?`,
      message: 'This will permanently remove the event and all associated attendee registrations. This action cannot be undone.',
      confirmText: 'Delete Event',
      onConfirm: async () => {
        try {
          await deleteAdminEvent(event._id);
          toast.success('Event deleted successfully.');
          loadDashboardData();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to delete event.');
        }
      },
    });
  };

  // Confirm and delete attendee registration
  const handleDeleteRegistrationClick = (reg) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Attendee Registration?',
      message: `Remove ${reg.user_name} (${reg.user_email}) from ${reg.event_id?.title || 'this event'}?`,
      confirmText: 'Remove Attendee',
      onConfirm: async () => {
        try {
          await deleteAdminRegistration(reg._id);
          toast.success('Attendee registration removed.');
          loadDashboardData();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to remove registration.');
        }
      },
    });
  };

  // Filtered lists
  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRegistrations = registrations.filter(
    (r) =>
      r.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.event_id?.title && r.event_id.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ── Unauthenticated Organizer Login View ────────────────────────
  if (!token) {
    return (
      <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '460px',
            margin: '0 1.5rem',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '1.25rem',
            padding: '2.5rem 2rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.15)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 25px rgba(124, 58, 237, 0.4)',
            }}
          >
            <ShieldCheck size={28} color="white" />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Organizer Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Sign in to manage events, track registrations, and curate attendee experiences.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Organizer Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@eventhub.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                justifyContent: 'center',
                marginTop: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Organizer'}
              <ArrowRight size={16} />
            </button>

            {/* Quick Demo Fill Button */}
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.875rem',
                background: 'rgba(124, 58, 237, 0.08)',
                border: '1px dashed rgba(124, 58, 237, 0.3)',
                borderRadius: '0.75rem',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '0.78rem', color: '#a78bfa', marginBottom: '0.5rem' }}>
                Quick Evaluation Credentials:
              </p>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <Sparkles size={14} />
                Click here to 1-Click Demo Login (admin@eventhub.com)
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    );
  }

  // ── Authenticated Organizer Dashboard ───────────────────────────
  return (
    <main style={{ minHeight: '100vh', paddingTop: '90px', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: '#c084fc',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <ShieldCheck size={13} />
                Organizer Portal
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Signed in as <strong style={{ color: '#f1f5f9' }}>{adminUser?.name || 'Organizer'}</strong> ({adminUser?.email})
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
              Event Operations Hub
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={openCreateModal}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}
            >
              <Plus size={16} />
              Create New Event
            </button>
            <button
              onClick={loadDashboardData}
              title="Refresh Data"
              className="btn"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: '#94a3b8',
                padding: '0.75rem',
              }}
            >
              <RefreshCw size={16} className={loadingData ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="btn"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: '1rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa',
                }}
              >
                <Calendar size={22} />
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Active Events
                </p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
                  {stats.totalEvents}
                </h3>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: '1rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Users size={22} />
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Registrations
                </p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
                  {stats.totalRegistrations}
                </h3>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: '1rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <Layers size={22} />
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Total Capacity
                </p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
                  {stats.totalCapacity}
                </h3>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: '1rem',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Capacity Filled
                </p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>
                  {stats.capacityFilledPct}%
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls + Search Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.7)', padding: '0.35rem', borderRadius: '0.75rem', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
            <button
              onClick={() => setActiveTab('events')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: activeTab === 'events' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                color: activeTab === 'events' ? '#ffffff' : '#94a3b8',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.2s',
              }}
            >
              <Calendar size={15} />
              Manage Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('registrations')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: activeTab === 'registrations' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                color: activeTab === 'registrations' ? '#ffffff' : '#94a3b8',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.2s',
              }}
            >
              <Users size={15} />
              Attendee Registrations ({registrations.length})
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'events' ? 'Search events, tags...' : 'Search attendees or events...'}
              style={{
                width: '100%',
                padding: '0.55rem 0.875rem 0.55rem 2.5rem',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: '0.625rem',
                color: '#f8fafc',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* TAB 1: MANAGE EVENTS */}
        {activeTab === 'events' && (
          <div>
            {filteredEvents.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '1rem',
                  border: '1px dashed rgba(148, 163, 184, 0.15)',
                }}
              >
                <Calendar size={40} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  No events found
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {searchQuery ? 'Try matching different search terms.' : 'Create your first event to get started.'}
                </p>
                <button onClick={openCreateModal} className="btn btn-primary">
                  <Plus size={16} />
                  Create Event
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {filteredEvents.map((event) => {
                  const regCount = registrations.filter(
                    (r) => (r.event_id?._id || r.event_id) === event._id
                  ).length;
                  const pct = Math.min(100, Math.round((regCount / (event.total_capacity || 1)) * 100));

                  return (
                    <motion.div
                      key={event._id}
                      layout
                      style={{
                        background: 'rgba(15, 23, 42, 0.75)',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div>
                        {/* Header Badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                              background: 'rgba(124, 58, 237, 0.15)',
                              color: '#c084fc',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {event.category || 'General'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.625rem', lineHeight: 1.35 }}>
                          {event.title}
                        </h3>

                        {/* Location */}
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.875rem' }}>
                          <MapPin size={14} color="#64748b" />
                          {event.location}
                        </p>

                        {/* Capacity Progress Bar */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                            <span>Registrations</span>
                            <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                              {regCount} / {event.total_capacity} ({pct}%)
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                                borderRadius: '9999px',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <button
                          onClick={() => openEditModal(event)}
                          style={{
                            flex: 1,
                            padding: '0.55rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            background: 'rgba(30, 41, 59, 0.6)',
                            color: '#e2e8f0',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                          }}
                        >
                          <Edit3 size={14} />
                          Edit Event
                        </button>
                        <button
                          onClick={() => handleDeleteEventClick(event)}
                          style={{
                            padding: '0.55rem 0.875rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#f87171',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: '1rem',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
            }}
          >
            {filteredRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Users size={40} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  No registrations found
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {searchQuery ? 'Try clearing your search query.' : 'Attendee registrations will appear here when users sign up.'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.5)', borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }}>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Attendee</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Registered Event</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Registered At</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => (
                      <tr
                        key={reg._id}
                        style={{
                          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{reg.user_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{reg.user_email}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 500, color: '#cbd5e1' }}>
                            {reg.event_id?.title || 'Unknown Event'}
                          </div>
                          {reg.event_id?.category && (
                            <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>
                              {reg.event_id.category}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                          {reg.registration_date
                            ? new Date(reg.registration_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteRegistrationClick(reg)}
                            title="Remove Registration"
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: '0.5rem',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#f87171',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              background: 'rgba(2, 6, 23, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '580px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '1.25rem',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {editingEventId ? 'Edit Event Details' : 'Create & Publish New Event'}
                </h2>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g., AI Global Summit 2026"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '0.625rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Category
                    </label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.625rem',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Summit">Summit</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Design">Design</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Total Capacity (Seats) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={eventForm.total_capacity}
                      onChange={(e) => setEventForm({ ...eventForm, total_capacity: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.625rem',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.625rem',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Location / Venue *
                    </label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="e.g., Tech Park Block 3, Auditorium"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.625rem',
                        color: '#f8fafc',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={eventForm.tags}
                    onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })}
                    placeholder="AI, Robotics, WebDev, Networking"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '0.625rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Detailed Event Description *
                  </label>
                  <textarea
                    rows={4}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Provide full description, agenda highlights, and expectations..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '0.625rem',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '0.625rem',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      background: 'transparent',
                      color: '#cbd5e1',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEvent}
                    className="btn btn-primary"
                    style={{ flex: 1.5, padding: '0.75rem', justifyContent: 'center' }}
                  >
                    {savingEvent ? 'Saving...' : editingEventId ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </main>
  );
}
