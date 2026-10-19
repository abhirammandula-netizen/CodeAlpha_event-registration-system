import React from 'react';

export function EventCardSkeleton() {
  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{ height: '3px', background: 'rgba(71,85,105,0.3)', borderRadius: '1.25rem 1.25rem 0 0' }} />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ width: '30%', height: '22px' }} />
        <div className="skeleton" style={{ width: '85%', height: '22px' }} />
        <div className="skeleton" style={{ width: '60%', height: '18px' }} />
        <div className="skeleton" style={{ height: '36px' }} />
        <div style={{ borderTop: '1px solid rgba(71,85,105,0.2)' }} />
        <div className="skeleton" style={{ height: '14px' }} />
        <div className="skeleton" style={{ height: '14px', width: '70%' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ width: '60px', height: '22px', borderRadius: '9999px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '4px', borderRadius: '9999px' }} />
        <div className="skeleton" style={{ height: '44px', borderRadius: '0.75rem', marginTop: '0.5rem' }} />
      </div>
    </div>
  );
}

export function RegistrationCardSkeleton() {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div className="skeleton" style={{ width: '80%', height: '20px' }} />
      <div className="skeleton" style={{ width: '50%', height: '14px' }} />
      <div className="skeleton" style={{ width: '65%', height: '14px' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="skeleton" style={{ width: '100px', height: '36px', borderRadius: '0.625rem' }} />
      </div>
    </div>
  );
}
