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
  Collapse,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleExpand = (section) => {
    setExpanded(expanded === section ? '' : section);
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      sx={{ 
        '& .MuiDrawer-paper': { 
          width: isMobile ? '100%' : isTablet ? 280 : 320,
          maxHeight: isMobile ? '80vh' : '100vh',
          borderTopLeftRadius: isMobile ? 16 : 0,
          borderTopRightRadius: isMobile ? 16 : 0
        } 
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: isMobile ? 1.5 : 2,
          background: 'linear-gradient(135deg, rgba(55, 71, 79, 0.02), rgba(255, 64, 129, 0.02))',
          borderBottom: '1px solid rgba(55, 71, 79, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School 
            sx={{ 
              color: '#FF4081',
              fontSize: isMobile ? 24 : 28
            }} 
          />
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(45deg, #37474F, #FF4081)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tips & Guides
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          size={isMobile ? "small" : "medium"}
        >
          <Close />
        </IconButton>
      </Box>

      <List sx={{ overflowY: 'auto', pt: 0 }}>
        {Object.entries(guides).map(([experiment, content]) => (
          <React.Fragment key={experiment}>
            <ListItem 
              button 
              onClick={() => handleExpand(experiment)}
              sx={{
                py: isMobile ? 1.5 : 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 64, 129, 0.05)'
                }
              }}
            >
              <ListItemIcon>
                <School sx={{ color: '#FF4081' }} />
              </ListItemIcon>
              <ListItemText 
                primary={experiment}
                primaryTypographyProps={{
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: 500
                }} 
              />
              {expanded === experiment ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={expanded === experiment} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem sx={{ pl: isMobile ? 3 : 4 }}>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: '#FF4081',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: isMobile ? '0.85rem' : '0.9rem'
                      }}
                    >
                      Tips:
                    </Typography>
                    {content.tips.map((tip, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          mb: isMobile ? 0.75 : 1,
                          alignItems: 'flex-start'
                        }}
                      >
                        <LightbulbOutlined 
                          sx={{ 
                            mr: 1, 
                            color: 'warning.main',
                            fontSize: isMobile ? 18 : 20,
                            mt: 0.2
                          }} 
                        />
                        <Typography 
                          variant="body2"
                          sx={{
                            fontSize: isMobile ? '0.8rem' : '0.875rem'
                          }}
                        >
                          {tip}
                        </Typography>
                      </Box>
                    ))}
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: '#FF4081',
                        fontWeight: 600,
                        mt: 2,
                        mb: 1,
                        fontSize: isMobile ? '0.85rem' : '0.9rem'
                      }}
                    >
                      How it works:
                    </Typography>
                    {content.explanations.map((exp, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          mb: isMobile ? 0.75 : 1,
                          alignItems: 'flex-start'
                        }}
                      >
                        <Help 
                          sx={{ 
                            mr: 1, 
                            color: 'info.main',
                            fontSize: isMobile ? 18 : 20,
                            mt: 0.2
                          }} 
                        />
                        <Typography 
                          variant="body2"
                          sx={{
                            fontSize: isMobile ? '0.8rem' : '0.875rem'
                          }}
                        >
                          {exp}
                        </Typography>
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