import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../firebase/auth';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Alert,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await registerUser(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <Container 
      component="main" 
      maxWidth="xs"
      sx={{
        px: isMobile ? 2 : 3,
      }}
    >
      <Box
        sx={{
          marginTop: isMobile ? 4 : 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4, // Add bottom margin for mobile scrolling
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: isMobile ? 2 : 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: theme.shape.borderRadius,
          }}
        >
          <Typography 
            component="h1" 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              mb: 3,
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            Create Account
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}
            >
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              '& .MuiTextField-root': { my: 1 }
            }}
          >
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size={isMobile ? "small" : "medium"}
              sx={{ mb: isMobile ? 1 : 2 }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size={isMobile ? "small" : "medium"}
              sx={{ mb: isMobile ? 1 : 2 }}
            />
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size={isMobile ? "small" : "medium"}
              sx={{ mb: isMobile ? 2 : 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2, 
                mb: 2,
                py: isMobile ? 1 : 1.5,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}
              size={isMobile ? "medium" : "large"}
            >
              Create Account
            </Button>
            <Box sx={{ 
              textAlign: 'center',
              mt: isMobile ? 1 : 2 
            }}>
              <Button
                onClick={handleSignIn}
                variant="text"
                sx={{ 
                  textTransform: 'none',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                Already have an account? Sign in
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;