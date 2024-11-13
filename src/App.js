// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
          }
        }
      }
    }
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  }
});

function App() {
  return (
    <AuthProvider>
      <TutorialProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div>
              <Navigation />
              <Routes>
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </TutorialProvider>
    </AuthProvider>
  );
}

export default App;