// src/components/feedback/ExperimentFeedback.jsx
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
  Snackbar
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { saveFeedback } from '../../firebase/feedback';

const difficultyLevels = ['Too Easy', 'Just Right', 'Challenging', 'Too Difficult'];
const experienceLabels = ['Confusing', 'Neutral', 'Intuitive', 'Excellent'];

const ExperimentFeedback = ({ open, onClose, experimentType }) => {
  const { user } = useAuth();
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
      >
        <DialogTitle>
          How was your experience?
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography component="legend">Overall Rating</Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>

          <FormControl component="fieldset" sx={{ my: 2 }}>
            <FormLabel component="legend">Difficulty Level</FormLabel>
            <RadioGroup
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {difficultyLevels.map((level) => (
                <FormControlLabel
                  key={level}
                  value={level}
                  control={<Radio />}
                  label={level}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ my: 2 }}>
            <Typography gutterBottom>User Experience</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {experienceLabels.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  onClick={() => setExperience(label)}
                  color={experience === label ? "primary" : "default"}
                  variant={experience === label ? "filled" : "outlined"}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            label="What could be improved?"
            multiline
            rows={2}
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            sx={{ my: 2 }}
          />

          <TextField
            fullWidth
            label="Additional Comments"
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ my: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Skip</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!rating}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExperimentFeedback;