// src/components/dashboard/Achievements.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Science as ScienceIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getAchievements } from '../../firebase/achievements';

const badges = {
  beginner: { count: 1, color: '#CD7F32', name: 'Beginner' },
  intermediate: { count: 5, color: '#C0C0C0', name: 'Intermediate' },
  expert: { count: 10, color: '#FFD700', name: 'Expert' }
};

const AchievementCard = ({ title, count, icon: Icon, badges }) => {
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
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ mr: 1, color: level ? badges[level].color : 'grey' }} />
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {count || 0}
        </Typography>
        {level && (
          <Typography color="textSecondary" gutterBottom>
            Current Level: {badges[level].name}
          </Typography>
        )}
        {nextLevel && (
          <Tooltip title={`${count}/${badges[nextLevel].count} to ${badges[nextLevel].name}`}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState(null);

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
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Achievements
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <AchievementCard
            title="Wave Generator"
            count={achievements.waveGenerator}
            icon={ScienceIcon}
            badges={badges}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AchievementCard
            title="Sound Analysis"
            count={achievements.soundAnalysis}
            icon={StarIcon}
            badges={badges}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <AchievementCard
            title="Doppler Effect"
            count={achievements.dopplerEffect}
            icon={TrophyIcon}
            badges={badges}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Achievements;