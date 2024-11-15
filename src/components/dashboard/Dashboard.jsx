// src/components/dashboard/Dashboard.jsx
import React from 'react';
import { Container, Typography, Grid, Paper, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Waves, GraphicEq, Speed } from '@mui/icons-material';
import ResultsHistory from './ResultsHistory';
import ProgressSection from './ProgressSection';
import Achievements from './Achievements';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

const ExperimentCard = ({ title, description, icon, onClick }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 240,
      cursor: 'pointer',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, rgba(55, 71, 79, 0.1), rgba(255, 64, 129, 0.1))',
        transition: 'opacity 0.3s ease-in-out',
        opacity: 0,
      },
      '&:hover::before': {
        opacity: 1,
      }
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 2,
      '& .MuiSvgIcon-root': {
        fontSize: '2rem',
        color: 'primary.main',
        transition: 'transform 0.3s ease-in-out',
        marginRight: 1
      },
      '&:hover .MuiSvgIcon-root': {
        transform: 'scale(1.1) rotate(5deg)',
      }
    }}>
      {icon}
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        {title}
      </Typography>
    </Box>
    <Typography variant="body1" paragraph>
      {description}
    </Typography>
    <Button
      variant="contained"
      onClick={onClick}
      sx={{ 
        mt: 'auto',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      Start Experiment
    </Button>
  </Paper>
);

const Dashboard = () => {
  const navigate = useNavigate();

  const experiments = [
    {
      title: 'Wave Generator',
      description: 'Create and analyze different types of waves',
      path: '/wave-generator',
      icon: <Waves />
    },
    {
      title: 'Sound Analysis',
      description: 'Analyze sound frequencies and patterns',
      path: '/sound-analysis',
      icon: <GraphicEq />
    },
    {
      title: 'Doppler Effect',
      description: 'Simulate and study the Doppler effect',
      path: '/doppler-effect',
      icon: <Speed />
    }
  ];

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 4, 
        mb: 4,
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          fontWeight: 600,
          background: 'linear-gradient(45deg, #37474F, #FF4081)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Virtual Lab Dashboard
      </Typography>

      <Grid container spacing={3}>
        {experiments.map((experiment) => (
          <Grid item xs={12} md={4} key={experiment.title}>
            <ExperimentCard
              title={experiment.title}
              description={experiment.description}
              icon={experiment.icon}
              onClick={() => navigate(experiment.path)}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ 
        '& > *': { 
          mt: 4,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }
        }
      }}>
        <ProgressSection />
        <Achievements />
        <AnalyticsDashboard />
        <ResultsHistory />
      </Box>
    </Container>
  );
};

export default Dashboard;