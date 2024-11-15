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
  // ... konfigurasi theme tetap sama ...
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
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                {/* ... routes lainnya ... */}
              </Routes>
            </div>
          </HashRouter>
        </ThemeProvider>
      </TutorialProvider>
    </AuthProvider>
  );
}

export default App;