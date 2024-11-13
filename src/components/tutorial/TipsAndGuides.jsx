// src/components/tutorial/TipsAndGuides.jsx
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Divider,
  Collapse
} from '@mui/material';
import {
  LightbulbOutlined,
  Help,
  School,
  ExpandMore,
  ExpandLess,
  Close
} from '@mui/icons-material';

const guides = {
  'Wave Generator': {
    tips: [
      'Adjust frequency to change wave speed',
      'Higher amplitude means bigger waves',
      'Try different wave types to see their patterns'
    ],
    explanations: [
      'Sine waves are smooth and continuous',
      'Square waves switch between two values',
      'Triangle waves have linear transitions'
    ]
  },
  'Sound Analysis': {
    tips: [
      'Use a quiet environment for better results',
      'Keep microphone at consistent distance',
      'Watch the frequency spectrum in real-time'
    ],
    explanations: [
      'Higher peaks show dominant frequencies',
      'Pattern changes indicate sound changes',
      'Color intensity shows sound strength'
    ]
  },
  'Doppler Effect': {
    tips: [
      'Start with lower speeds first',
      'Notice frequency changes as source moves',
      'Compare different sound types'
    ],
    explanations: [
      'Frequency increases as source approaches',
      'Frequency decreases as source moves away',
      'Speed affects the intensity of the effect'
    ]
  }
};

const TipsAndGuides = ({ open, onClose }) => {
  const [expanded, setExpanded] = useState('');

  const handleExpand = (section) => {
    setExpanded(expanded === section ? '' : section);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 320 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6">Tips & Guides</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {Object.entries(guides).map(([experiment, content]) => (
          <React.Fragment key={experiment}>
            <ListItem button onClick={() => handleExpand(experiment)}>
              <ListItemIcon>
                <School />
              </ListItemIcon>
              <ListItemText primary={experiment} />
              {expanded === experiment ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={expanded === experiment} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem sx={{ pl: 4 }}>
                  <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Tips:
                    </Typography>
                    {content.tips.map((tip, index) => (
                      <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                        <LightbulbOutlined sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2">{tip}</Typography>
                      </Box>
                    ))}
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                      How it works:
                    </Typography>
                    {content.explanations.map((exp, index) => (
                      <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                        <Help sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="body2">{exp}</Typography>
                      </Box>
                    ))}
                  </Box>
                </ListItem>
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default TipsAndGuides;