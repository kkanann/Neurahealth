import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
