import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScienceIcon from '@mui/icons-material/Science';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../../context/AuthContext';
import { getAchievements } from '../../firebase/achievements';

const badges = {
  beginner: { 
    count: 1, 
    color: '#FF4081',
    name: 'Beginner',
    background: 'rgba(255, 64, 129, 0.1)'
  },
  intermediate: { 
    count: 5, 
    color: '#546E7A',
    name: 'Intermediate',
    background: 'rgba(84, 110, 122, 0.1)'
  },
  expert: { 
    count: 10, 
    color: '#37474F',
    name: 'Expert',
    background: 'rgba(55, 71, 79, 0.1)'
  }
};

const AchievementCard = ({ title, count, icon: Icon, badges }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getBadgeLevel = (count) => {
    if (count >= 10) return 'expert';
    if (count >= 5) return 'intermediate';
    if (count >= 1) return 'beginner';
    return null;
  };

  const level = getBadgeLevel(count);
  const nextLevel = count >= 10 ? null : count >= 5 ? 'expert' : count >= 1 ? 'intermediate' : 'beginner';
  const progress = nextLevel ? (count / badges[nextLevel].count) * 100 : 100;

  return (
    <Card
      sx={{
        background: 'white',
        transition: 'all 0.3s ease-in-out',
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
          background: level ? `linear-gradient(45deg, ${badges[level].color}, ${badges[level].color}88)` : 'transparent'
        }
      }}
    >
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: isMobile ? 1 : 2,
            p: isMobile ? 0.5 : 1,
            borderRadius: 2,
            backgroundColor: level ? badges[level].background : 'transparent'
          }}
        >
          <Icon sx={{ 
            mr: 1, 
            color: level ? badges[level].color : '#9E9E9E',
            fontSize: isMobile ? 24 : 32,
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: isTablet ? 'none' : 'rotate(10deg) scale(1.1)'
            }
          }} />
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ 
              color: level ? badges[level].color : '#9E9E9E',
              fontWeight: 600,
              fontSize: isMobile ? '1rem' : 'inherit'
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography 
          variant={isMobile ? "h4" : "h3"}
          sx={{ 
            fontWeight: 700,
            color: level ? badges[level].color : '#9E9E9E',
            textAlign: 'center',
            mb: isMobile ? 1 : 2
          }}
        >
          {count || 0}
        </Typography>
        {level && (
          <Fade in={true}>
            <Typography 
              variant={isMobile ? "body2" : "body1"}
              sx={{ 
                color: badges[level].color,
                textAlign: 'center',
                fontWeight: 500,
                mb: isMobile ? 1 : 2
              }}
            >
              {badges[level].name} Level
            </Typography>
          </Fade>
        )}
        {nextLevel && (
          <Tooltip 
            title={`${count}/${badges[nextLevel].count} to ${badges[nextLevel].name}`}
            placement="top"
            arrow
          >
            <Box sx={{ position: 'relative', pt: isMobile ? 0.5 : 1 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: isMobile ? 6 : 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(55, 71, 79, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${badges[nextLevel].color}, ${badges[nextLevel].color}88)`,
                    borderRadius: 4
                  }
                }}
              />
              <Typography 
                variant="caption"
                sx={{ 
                  position: 'absolute',
                  top: isMobile ? -16 : -20,
                  right: 0,
                  color: badges[nextLevel].color,
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
                }}
              >
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchAchievements = async () => {
      if (user) {
        try {
          const data = await getAchievements(user.uid);
          setAchievements(data.experiments || {});
        } catch (error) {
          console.error('Error fetching achievements:', error);
        }
      }
    };

    fetchAchievements();
  }, [user]);

  if (!achievements) return null;

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
        Achievements
      </Typography>
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} sm={6} md={4}>
          <AchievementCard
            title="Wave Generator"
            count={achievements.waveGenerator}
            icon={ScienceIcon}
            badges={badges}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AchievementCard
            title="Sound Analysis"
            count={achievements.soundAnalysis}
            icon={StarIcon}
            badges={badges}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AchievementCard
            title="Doppler Effect"
            count={achievements.dopplerEffect}
            icon={EmojiEventsIcon}
            badges={badges}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Achievements;