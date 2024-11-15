// src/App.js
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { TutorialProvider } from './components/tutorial/TutorialProvider';
import ProtectedRoute from './components/common/ProtectedRoute';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Navigation from './components/common/Navigation';
import WaveGenerator from './components/experiments/WaveGenerator';
import SoundAnalysis from './components/experiments/SoundAnalysis';
import DopplerEffect from './components/experiments/DopplerEffect';
import UserProfile from './components/profile/UserProfile';
import UMLGenerator from './components/documentation/UMLGenerator';

const theme = createTheme({
  // ... theme configuration tetap sama
});

function App() {
  return (
    <AuthProvider>
      <TutorialProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <HashRouter>
            <div>
              <Navigation />
              <Routes>
                {/* Redirect dari root ke login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wave-generator" 
                  element={
                    <ProtectedRoute>
                      <WaveGenerator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sound-analysis" 
                  element={
                    <ProtectedRoute>
                      <SoundAnalysis />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/doppler-effect" 
                  element={
                    <ProtectedRoute>
                      <DopplerEffect />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/documentation" 
                  element={
                    <ProtectedRoute>
                      <UMLGenerator />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch all undefined routes */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </HashRouter>
        </ThemeProvider>
      </TutorialProvider>
    </AuthProvider>
  );
}

export default App;