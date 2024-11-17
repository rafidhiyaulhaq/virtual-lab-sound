import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Science, GraphicEq, Speed } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getProgress } from '../../firebase/progress';

const ProgressCard = ({ Icon, title, count, percentage, isMobile, isTablet }) => (
  <Card
    sx={{
      background: 'white',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: isTablet ? 'none' : 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
      },
      '&:active': {
        transform: isTablet ? 'scale(0.98)' : 'translateY(-4px)',
      },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: isMobile ? '3px' : '4px',
        background: 'linear-gradient(45deg, #37474F, #FF4081)'
      }
    }}
  >
    <CardContent sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 2 }}>
        <Icon sx={{ 
          fontSize: isMobile ? 30 : 40, 
          color: '#FF4081',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: isTablet ? 'none' : 'rotate(10deg) scale(1.1)'
          }
        }} />
        <Typography 
          sx={{ 
            ml: 2,
            fontWeight: 500,
            color: '#37474F',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography 
        variant={isMobile ? "h5" : "h4"}
        sx={{ 
          mb: isMobile ? 1 : 2,
          color: '#FF4081',
          fontWeight: 600,
          textAlign: 'center'
        }}
      >
        {count || 0}
      </Typography>
      <Box sx={{ mt: isMobile ? 1 : 2 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: isMobile ? 8 : 10,
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
);

const ProgressSection = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
        p: isMobile ? 2 : 3, 
        mt: isMobile ? 2 : 3,
        background: 'linear-gradient(135deg, rgba(55, 71, 79, 0.02), rgba(255, 64, 129, 0.02))',
        borderRadius: isMobile ? 2 : 3,
        border: '1px solid rgba(55, 71, 79, 0.08)'
      }}
    >
      <Typography 
        variant={isMobile ? "subtitle1" : "h6"}
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: '#37474F',
          mb: isMobile ? 2 : 3,
          fontSize: isMobile ? '1.1rem' : 'inherit'
        }}
      >
        Your Progress
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} sm={6} md={4}>
          <ProgressCard
            Icon={Science}
            title="Wave Generator"
            count={progress?.waveGeneratorCount}
            percentage={calculatePercentage(progress?.waveGeneratorCount)}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ProgressCard
            Icon={GraphicEq}
            title="Sound Analysis"
            count={progress?.soundAnalysisCount}
            percentage={calculatePercentage(progress?.soundAnalysisCount)}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ProgressCard
            Icon={Speed}
            title="Doppler Effect"
            count={progress?.dopplerEffectCount}
            percentage={calculatePercentage(progress?.dopplerEffectCount)}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </Grid>
      </Grid>
      <Box 
        sx={{ 
          mt: isMobile ? 2 : 3,
          p: isMobile ? 1.5 : 2,
          borderRadius: isMobile ? 1.5 : 2,
          backgroundColor: 'rgba(55, 71, 79, 0.03)',
          border: '1px solid rgba(55, 71, 79, 0.05)'
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#546E7A',
            mb: isMobile ? 0.5 : 1,
            fontSize: isMobile ? '0.8rem' : '0.875rem'
          }}
        >
          Total Experiments: {progress?.totalExperiments || 0}
        </Typography>
        {progress?.lastUpdated && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#546E7A',
              fontSize: isMobile ? '0.8rem' : '0.875rem'
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