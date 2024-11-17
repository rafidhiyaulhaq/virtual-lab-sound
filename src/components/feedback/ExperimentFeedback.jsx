import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  TextField,
  Box,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { saveFeedback } from '../../firebase/feedback';

const difficultyLevels = ['Too Easy', 'Just Right', 'Challenging', 'Too Difficult'];
const experienceLabels = ['Confusing', 'Neutral', 'Intuitive', 'Excellent'];

const ExperimentFeedback = ({ open, onClose, experimentType }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState('');
  const [experience, setExperience] = useState('');
  const [improvement, setImprovement] = useState('');
  const [comments, setComments] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async () => {
    try {
      const feedbackData = {
        rating,
        difficulty,
        experience,
        improvement,
        comments
      };

      await saveFeedback(user.uid, experimentType, feedbackData);
      setSnackbar({
        open: true,
        message: 'Thank you for your feedback!',
        severity: 'success'
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving feedback:', error);
      setSnackbar({
        open: true,
        message: 'Error saving feedback',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setRating(0);
    setDifficulty('');
    setExperience('');
    setImprovement('');
    setComments('');
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            borderRadius: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: isMobile ? '1.25rem' : '1.5rem',
          px: isMobile ? 2 : 3,
          py: isMobile ? 1.5 : 2,
          background: 'linear-gradient(135deg, rgba(55, 71, 79, 0.02), rgba(255, 64, 129, 0.02))',
          color: '#37474F',
          fontWeight: 600
        }}>
          How was your experience?
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ my: isMobile ? 1.5 : 2 }}>
            <Typography 
              component="legend" 
              sx={{ 
                mb: 1,
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 500
              }}
            >
              Overall Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size={isMobile ? "medium" : "large"}
              sx={{
                '& .MuiRating-icon': {
                  color: '#FF4081'
                }
              }}
            />
          </Box>

          <FormControl 
            component="fieldset" 
            sx={{ 
              my: isMobile ? 1.5 : 2,
              width: '100%'
            }}
          >
            <FormLabel 
              component="legend"
              sx={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 500,
                color: '#37474F'
              }}
            >
              Difficulty Level
            </FormLabel>
            <RadioGroup
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {difficultyLevels.map((level) => (
                <FormControlLabel
                  key={level}
                  value={level}
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: '#FF4081'
                        }
                      }}
                    />
                  }
                  label={level}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: isMobile ? '0.9rem' : '1rem'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ my: isMobile ? 1.5 : 2 }}>
            <Typography 
              gutterBottom
              sx={{ 
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 500,
                mb: 1
              }}
            >
              User Experience
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              flexWrap: 'wrap'
            }}>
              {experienceLabels.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  onClick={() => setExperience(label)}
                  color={experience === label ? "primary" : "default"}
                  variant={experience === label ? "filled" : "outlined"}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '&.MuiChip-colorPrimary': {
                      bgcolor: '#FF4081'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            label="What could be improved?"
            multiline
            rows={isMobile ? 2 : 3}
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            sx={{ 
              my: isMobile ? 1.5 : 2,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#FF4081'
                }
              },
              '& label.Mui-focused': {
                color: '#FF4081'
              }
            }}
          />

          <TextField
            fullWidth
            label="Additional Comments"
            multiline
            rows={isMobile ? 3 : 4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ 
              my: isMobile ? 1.5 : 2,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#FF4081'
                }
              },
              '& label.Mui-focused': {
                color: '#FF4081'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          p: isMobile ? 2 : 3,
          gap: 1
        }}>
          <Button 
            onClick={onClose}
            size={isMobile ? "medium" : "large"}
            sx={{
              color: '#546E7A',
              '&:hover': {
                backgroundColor: 'rgba(84, 110, 122, 0.05)'
              }
            }}
          >
            Skip
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!rating}
            size={isMobile ? "medium" : "large"}
            sx={{
              background: 'linear-gradient(45deg, #37474F, #FF4081)',
              '&:hover': {
                background: 'linear-gradient(45deg, #455A64, #FF80AB)',
                transform: isTablet ? 'none' : 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)'
              },
              '&.Mui-disabled': {
                background: 'rgba(55, 71, 79, 0.12)',
                color: 'rgba(55, 71, 79, 0.4)'
              }
            }}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top',
          horizontal: isMobile ? 'center' : 'right'
        }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            '&.MuiAlert-standardSuccess': {
              backgroundImage: 'linear-gradient(45deg, rgba(55, 71, 79, 0.05), rgba(255, 64, 129, 0.05))'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExperimentFeedback;