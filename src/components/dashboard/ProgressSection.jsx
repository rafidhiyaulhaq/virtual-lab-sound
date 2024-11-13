// src/components/dashboard/ProgressSection.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Science, GraphicEq, Speed } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getProgress } from '../../firebase/progress';

const ProgressSection = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        try {
          const userProgress = await getProgress(user.uid);
          setProgress(userProgress);
        } catch (error) {
          console.error('Error fetching progress:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgress();
  }, [user]);

  if (loading) {
    return (
      <LinearProgress 
        sx={{ 
          backgroundColor: 'rgba(55, 71, 79, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(45deg, #37474F, #FF4081)'
          }
        }} 
      />
    );
  }

  const calculatePercentage = (count) => {
    return ((count || 0) / Math.max(progress.totalExperiments, 1)) * 100;
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        mt: 3,
        background: 'linear-gradient(135deg, rgba(55, 71, 79, 0.02), rgba(255, 64, 129, 0.02))',
        borderRadius: 3,
        border: '1px solid rgba(55, 71, 79, 0.08)'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: '#37474F',
          mb: 3
        }}
      >
        Your Progress
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'white',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(45deg, #37474F, #FF4081)'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Science sx={{ fontSize: 40, color: '#FF4081' }} />
                <Typography 
                  sx={{ 
                    ml: 2,
                    fontWeight: 500,
                    color: '#37474F'
                  }}
                >
                  Wave Generator
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2,
                  color: '#FF4081',
                  fontWeight: 600
                }}
              >
                {progress?.waveGeneratorCount || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={calculatePercentage(progress?.waveGeneratorCount)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(55, 71, 79, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #37474F, #FF4081)',
                      borderRadius: 5
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'white',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(45deg, #37474F, #FF4081)'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GraphicEq sx={{ fontSize: 40, color: '#FF4081' }} />
                <Typography 
                  sx={{ 
                    ml: 2,
                    fontWeight: 500,
                    color: '#37474F'
                  }}
                >
                  Sound Analysis
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2,
                  color: '#FF4081',
                  fontWeight: 600
                }}
              >
                {progress?.soundAnalysisCount || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={calculatePercentage(progress?.soundAnalysisCount)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(55, 71, 79, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #37474F, #FF4081)',
                      borderRadius: 5
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: 'white',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(45deg, #37474F, #FF4081)'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed sx={{ fontSize: 40, color: '#FF4081' }} />
                <Typography 
                  sx={{ 
                    ml: 2,
                    fontWeight: 500,
                    color: '#37474F'
                  }}
                >
                  Doppler Effect
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2,
                  color: '#FF4081',
                  fontWeight: 600
                }}
              >
                {progress?.dopplerEffectCount || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={calculatePercentage(progress?.dopplerEffectCount)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(55, 71, 79, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #37474F, #FF4081)',
                      borderRadius: 5
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box 
        sx={{ 
          mt: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'rgba(55, 71, 79, 0.03)',
          border: '1px solid rgba(55, 71, 79, 0.05)'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#546E7A',
            mb: 1
          }}
        >
          Total Experiments: {progress?.totalExperiments || 0}
        </Typography>
        {progress?.lastUpdated && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#546E7A'
            }}
          >
            Last Updated: {new Date(progress.lastUpdated).toLocaleString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ProgressSection;