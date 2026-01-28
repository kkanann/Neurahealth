import React from 'react';
import Navbar from '../components/Navbar';

const PatientDashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: '4rem' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h2 className="text-gradient">Patient Portal</h2>
          <p>Welcome back, John.</p>
           <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <h4>My Health Record</h4>
                <p style={{ color: 'var(--color-text-muted)' }}>Latest update: Jan 28, 2026</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
