import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CRTOverlay } from './components/CRTOverlay';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TargetsFeed } from './pages/TargetsFeed';
import { AssessmentArena } from './pages/AssessmentArena';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Subtle tactical vintage CRT overlay layer */}
        <CRTOverlay />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/targets" element={<TargetsFeed />} />
          <Route path="/arena" element={<AssessmentArena />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
