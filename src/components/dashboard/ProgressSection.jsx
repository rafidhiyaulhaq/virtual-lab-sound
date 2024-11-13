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
    return <LinearProgress />;
  }

  const calculatePercentage = (count) => {
    return ((count || 0) / Math.max(progress.totalExperiments, 1)) * 100;
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Your Progress
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Wave Generator
              </Typography>
              <Typography variant="h4">
                {progress?.waveGeneratorCount || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={calculatePercentage(progress?.waveGeneratorCount)} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sound Analysis
              </Typography>
              <Typography variant="h4">
                {progress?.soundAnalysisCount || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={calculatePercentage(progress?.soundAnalysisCount)} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Doppler Effect
              </Typography>
              <Typography variant="h4">
                {progress?.dopplerEffectCount || 0}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={calculatePercentage(progress?.dopplerEffectCount)} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Total Experiments: {progress?.totalExperiments || 0}
        </Typography>
        {progress?.lastUpdated && (
          <Typography variant="body2" color="textSecondary">
            Last Updated: {new Date(progress.lastUpdated).toLocaleString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ProgressSection;