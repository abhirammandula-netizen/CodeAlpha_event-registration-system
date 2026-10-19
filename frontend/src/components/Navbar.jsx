import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CalendarDays, UserCircle2, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.125rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Event<span style={{ color: '#8b5cf6' }}>Hub</span>
          </span>
        </NavLink>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CalendarDays size={15} />
              Events
            </span>
          </NavLink>
          <NavLink
            to="/my-registrations"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <UserCircle2 size={15} />
              My Registrations
            </span>
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#c084fc' }}>
              <ShieldCheck size={14} />
              Organizer
            </span>
          </NavLink>
        </nav>
      </div>
    </motion.header>
  );
}
