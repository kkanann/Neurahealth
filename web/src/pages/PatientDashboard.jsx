import React from 'react';
import Navbar from '../components/Navbar';
import HealthAssistant from '../components/HealthAssistant';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <div className="container" style={{ marginTop: '4rem', paddingBottom: '3rem' }}>
        {/* Welcome Section */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 className="text-gradient" style={{ marginBottom: '0.5rem' }}>Patient Portal</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Welcome back! Access your health records and get AI-powered health assistance.
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Quick Stats */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Health Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Last Checkup</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>Jan 15, 2026</div>
              </div>
              <div style={{
                background: 'rgba(79, 70, 229, 0.1)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(79, 70, 229, 0.2)'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Upcoming Appointments</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>2 Scheduled</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚡ Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.875rem 1.25rem' }}>
                📅 Book Appointment
              </button>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.875rem 1.25rem', background: 'rgba(255,255,255,0.05)' }}>
                📋 View Medical Records
              </button>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.875rem 1.25rem', background: 'rgba(255,255,255,0.05)' }}>
                💊 Prescriptions
              </button>
            </div>
          </div>
        </div>

        {/* Health Assistant Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🤖 AI Health Assistant
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Get instant health guidance, find nearby hospitals, and access emergency helplines
            </p>
          </div>

          <HealthAssistant />
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)'
        }}>
          <strong style={{ color: '#fbbf24' }}>⚠️ Medical Disclaimer:</strong> The AI Health Assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
