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
  Cell,
  ResponsiveContainer
} from 'recharts';
import {
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getUserAnalytics } from '../../firebase/analytics';

const COLORS = ['#37474F', '#FF4081', '#546E7A', '#FF80AB'];

const StatCard = ({ title, value, icon: Icon }) => (
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
        <Icon sx={{ 
          fontSize: 40, 
          color: '#FF4081',
          mr: 2,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(10deg) scale(1.1)'
          }
        }} />
        <Typography 
          sx={{ 
            color: '#37474F',
            fontWeight: 500
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h3"
        sx={{ 
          fontWeight: 600,
          color: '#37474F',
          textAlign: 'right'
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children }) => (
  <Paper 
    sx={{ 
      p: 3,
      background: 'white',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
      },
      height: '100%'
    }}
  >
    <Typography 
      variant="h6" 
      gutterBottom
      sx={{ 
        color: '#37474F',
        fontWeight: 600,
        mb: 3
      }}
    >
      {title}
    </Typography>
    {children}
  </Paper>
);

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
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 400
        }}
      >
        <CircularProgress sx={{ color: '#FF4081' }} />
      </Box>
    );
  }

  const experimentTypes = analytics.experimentData.reduce((acc, exp) => {
    acc[exp.experimentType] = (acc[exp.experimentType] || 0) + 1;
    return acc;
  }, {});

  const experimentPieData = Object.entries(experimentTypes).map(([name, value]) => ({
    name,
    value
  }));

  const feedbackData = analytics.feedbackData.reduce((acc, fb) => {
    acc[fb.rating] = (acc[fb.rating] || 0) + 1;
    return acc;
  }, {});

  const ratingBarData = Object.entries(feedbackData).map(([rating, count]) => ({
    rating: `${rating} Stars`,
    count
  }));

  const averageRating = (
    analytics.feedbackData.reduce((acc, fb) => acc + fb.rating, 0) / 
    analytics.feedbackData.length || 0
  ).toFixed(1);

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
        variant="h5" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: '#37474F',
          mb: 3
        }}
      >
        Analytics Dashboard
      </Typography>
      <Divider sx={{ my: 2, opacity: 0.1 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Experiments"
            value={analytics.experimentCount}
            icon={ScienceIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Feedback Submissions"
            value={analytics.feedbackCount}
            icon={AssessmentIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Average Rating"
            value={averageRating}
            icon={StarIcon}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Experiment Distribution">
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={experimentPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {experimentPieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #37474F',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Feedback Ratings">
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={ratingBarData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#37474F20" />
                  <XAxis 
                    dataKey="rating" 
                    tick={{ fill: '#37474F' }}
                  />
                  <YAxis 
                    tick={{ fill: '#37474F' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #37474F',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="#FF4081"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AnalyticsDashboard;