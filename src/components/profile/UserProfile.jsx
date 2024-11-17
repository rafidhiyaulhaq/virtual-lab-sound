import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, getUserProfile } from '../../firebase/profile';

const UserProfile = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [profile, setProfile] = useState({
    displayName: '',
    institution: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setSnackbar({
            open: true,
            message: 'Error fetching profile',
            severity: 'error'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(user.uid, profile);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        m: isMobile ? 2 : 3 
      }}>
        <CircularProgress size={isMobile ? 30 : 40} />
      </Box>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
      <Paper 
        sx={{ 
          p: isMobile ? 2 : 4,
          background: 'linear-gradient(135deg, rgba(55, 71, 79, 0.02), rgba(255, 64, 129, 0.02))',
          borderRadius: isMobile ? 2 : 3,
          border: '1px solid rgba(55, 71, 79, 0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: isTablet ? 'none' : 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            mb: isMobile ? 2 : 4,
            gap: isMobile ? 2 : 3,
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          <Avatar
            sx={{ 
              width: isMobile ? 80 : 100, 
              height: isMobile ? 80 : 100,
              border: '2px solid #FF4081'
            }}
            alt={profile.displayName || user?.email}
          />
          <Box>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{
                fontWeight: 600,
                color: '#37474F',
                background: 'linear-gradient(45deg, #37474F, #FF4081)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              User Profile
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#546E7A',
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={profile.displayName}
                onChange={handleChange}
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF4081'
                    }
                  },
                  '& label.Mui-focused': {
                    color: '#FF4081'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Institution"
                name="institution"
                value={profile.institution}
                onChange={handleChange}
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF4081'
                    }
                  },
                  '& label.Mui-focused': {
                    color: '#FF4081'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={profile.role}
                onChange={handleChange}
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF4081'
                    }
                  },
                  '& label.Mui-focused': {
                    color: '#FF4081'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth={isMobile}
                size={isMobile ? "medium" : "large"}
                sx={{
                  mt: isMobile ? 1 : 2,
                  background: 'linear-gradient(45deg, #37474F, #FF4081)',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #455A64, #FF80AB)',
                    transform: isTablet ? 'none' : 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)'
                  }
                }}
              >
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top',
          horizontal: isMobile ? 'center' : 'right'
        }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            '&.MuiAlert-standardSuccess': {
              backgroundImage: 'linear-gradient(45deg, rgba(55, 71, 79, 0.05), rgba(255, 64, 129, 0.05))'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;