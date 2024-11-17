import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery
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

const StatCard = ({ title, value, icon: Icon, isMobile, isTablet }) => (
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
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: isMobile ? 1 : 2,
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left',
        gap: isMobile ? 1 : 2
      }}>
        <Icon sx={{ 
          fontSize: isMobile ? 32 : 40, 
          color: '#FF4081',
          mr: isMobile ? 0 : 2,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: isTablet ? 'none' : 'rotate(10deg) scale(1.1)'
          }
        }} />
        <Typography 
          sx={{ 
            color: '#37474F',
            fontWeight: 500,
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography 
        variant={isMobile ? "h4" : "h3"}
        sx={{ 
          fontWeight: 600,
          color: '#37474F',
          textAlign: 'center',
          mt: isMobile ? 1 : 2
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children, isMobile, isTablet }) => (
  <Paper 
    sx={{ 
      p: isMobile ? 2 : 3,
      background: 'white',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: isTablet ? 'none' : 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
      },
      height: '100%',
      borderRadius: isMobile ? 2 : 3
    }}
  >
    <Typography 
      variant={isMobile ? "subtitle1" : "h6"}
      gutterBottom
      sx={{ 
        color: '#37474F',
        fontWeight: 600,
        mb: isMobile ? 2 : 3,
        fontSize: isMobile ? '1rem' : '1.25rem'
      }}
    >
      {title}
    </Typography>
    {children}
  </Paper>
);

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
          minHeight: isMobile ? 300 : 400,
          p: isMobile ? 2 : 3
        }}
      >
        <CircularProgress 
          sx={{ 
            color: '#FF4081',
            size: isMobile ? 30 : 40
          }} 
        />
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
        p: isMobile ? 2 : 3, 
        mt: isMobile ? 2 : 3,
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
          alignItems: 'center',
          mb: isMobile ? 2 : 3,
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left',
          gap: isMobile ? 1 : 2
        }}
      >
        <AssessmentIcon sx={{ 
          fontSize: isMobile ? 32 : 40, 
          color: '#FF4081',
          mr: isMobile ? 0 : 2 
        }} />
        <Typography 
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 600,
            color: '#37474F',
            background: 'linear-gradient(45deg, #37474F, #FF4081)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Analytics Dashboard
        </Typography>
      </Box>

      <Divider 
        sx={{ 
          my: isMobile ? 1.5 : 2, 
          opacity: 0.1 
        }} 
      />

      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Experiments"
            value={analytics.experimentCount}
            icon={ScienceIcon}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Feedback Submissions"
            value={analytics.feedbackCount}
            icon={AssessmentIcon}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Rating"
            value={averageRating}
            icon={StarIcon}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard 
            title="Experiment Distribution" 
            isMobile={isMobile}
            isTablet={isTablet}
          >
            <Box sx={{ 
              height: isMobile ? 250 : 300, 
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden'
            }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={experimentPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                    label={{
                      fontSize: isMobile ? 10 : 12
                    }}
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
                      borderRadius: '4px',
                      fontSize: isMobile ? '0.8rem' : '0.875rem'
                    }}
                  />
                  <Legend 
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    align={isMobile ? "center" : "right"}
                    layout={isMobile ? "horizontal" : "vertical"}
                    wrapperStyle={{
                      fontSize: isMobile ? '0.8rem' : '0.875rem'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard 
            title="Feedback Ratings"
            isMobile={isMobile}
            isTablet={isTablet}
          >
            <Box sx={{ 
              height: isMobile ? 250 : 300, 
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden'
            }}>
              <ResponsiveContainer>
                <BarChart
                  data={ratingBarData}
                  margin={{ 
                    top: isMobile ? 10 : 20, 
                    right: isMobile ? 20 : 30, 
                    left: isMobile ? 10 : 20, 
                    bottom: isMobile ? 5 : 5 
                  }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#37474F20" 
                  />
                  <XAxis 
                    dataKey="rating" 
                    tick={{ 
                      fill: '#37474F',
                      fontSize: isMobile ? 10 : 12
                    }}
                  />
                  <YAxis 
                    tick={{ 
                      fill: '#37474F',
                      fontSize: isMobile ? 10 : 12
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #37474F',
                      borderRadius: '4px',
                      fontSize: isMobile ? '0.8rem' : '0.875rem'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: isMobile ? '0.8rem' : '0.875rem'
                    }}
                  />
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