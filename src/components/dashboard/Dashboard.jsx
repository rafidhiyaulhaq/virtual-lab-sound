// src/components/dashboard/Dashboard.jsx
import React from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ResultsHistory from './ResultsHistory';

const Dashboard = () => {
  const navigate = useNavigate();

  const experiments = [
    {
      title: 'Wave Generator',
      description: 'Create and analyze different types of waves',
      path: '/wave-generator'
    },
    {
      title: 'Sound Analysis',
      description: 'Analyze sound frequencies and patterns',
      path: '/sound-analysis'
    },
    {
      title: 'Doppler Effect',
      description: 'Simulate and study the Doppler effect',
      path: '/doppler-effect'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Virtual Lab Dashboard
      </Typography>
      <Grid container spacing={3}>
        {experiments.map((experiment) => (
          <Grid item xs={12} md={4} key={experiment.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                {experiment.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {experiment.description}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(experiment.path)}
                sx={{ mt: 'auto' }}
              >
                Start Experiment
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <ResultsHistory />
    </Container>
  );
};

export default Dashboard;