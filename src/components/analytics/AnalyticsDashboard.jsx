// src/components/analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getUserAnalytics } from '../../firebase/analytics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (user) {
        try {
          const data = await getUserAnalytics(user.uid);
          setAnalytics(data);
        } catch (error) {
          console.error('Error fetching analytics:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Prepare data for experiment type distribution
  const experimentTypes = analytics.experimentData.reduce((acc, exp) => {
    acc[exp.experimentType] = (acc[exp.experimentType] || 0) + 1;
    return acc;
  }, {});

  const experimentPieData = Object.entries(experimentTypes).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare data for feedback ratings
  const feedbackData = analytics.feedbackData.reduce((acc, fb) => {
    acc[fb.rating] = (acc[fb.rating] || 0) + 1;
    return acc;
  }, {});

  const ratingBarData = Object.entries(feedbackData).map(([rating, count]) => ({
    rating: `${rating} Stars`,
    count
  }));

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Experiments
              </Typography>
              <Typography variant="h3">
                {analytics.experimentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Feedback Submissions
              </Typography>
              <Typography variant="h3">
                {analytics.feedbackCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h3">
                {(analytics.feedbackData.reduce((acc, fb) => acc + fb.rating, 0) / 
                  analytics.feedbackData.length || 0).toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Experiment Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <PieChart width={400} height={300}>
                <Pie
                  data={experimentPieData}
                  cx={200}
                  cy={150}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {experimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Feedback Ratings
            </Typography>
            <Box sx={{ height: 300 }}>
              <BarChart
                width={400}
                height={300}
                data={ratingBarData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AnalyticsDashboard;