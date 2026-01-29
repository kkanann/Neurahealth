import React from 'react';
import Navbar from "../components/Navbar";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <header className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          Healthcare Reimagined for <br />
          <span className="text-gradient">The Modern Era</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Experience the future of medical management with NueraHealth. 
          Seamlessly connecting patients and specialists through advanced technology.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-primary">For Patients</button>
          <button className="btn-outline">For Doctors</button>
        </div>
      </header>
      
      <section className="container" style={{ marginTop: '8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Smart Scheduling</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>AI-powered appointment management that respects your time.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Secure Records</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>End-to-end encrypted medical history available at your fingertips.</p>
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Telehealth 2.0</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Crystal clear video consultations integrated directly into the platform.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
