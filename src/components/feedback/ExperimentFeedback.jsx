import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
 const navigate = useNavigate();
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
       comments,
       timestamp: new Date().toISOString()
     };

     await saveFeedback(user.uid, experimentType, feedbackData);
     setSnackbar({
       open: true,
       message: 'Thank you for your feedback!',
       severity: 'success'
     });
     onClose();
     resetForm();
     navigate('/dashboard', { replace: true });
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

 const handleSkip = () => {
   onClose();
   navigate('/dashboard', { replace: true });
 };

 return (
   <>
     <Dialog
       open={open}
       onClose={onClose}
       maxWidth="sm"
       fullWidth
       sx={{
         '& .MuiDialog-paper': {
           borderRadius: 2,
           boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
         }
       }}
     >
       <DialogTitle sx={{ 
         background: 'linear-gradient(45deg, #37474F, #FF4081)',
         color: 'white',
         py: 2
       }}>
         How was your experience?
       </DialogTitle>
       <DialogContent sx={{ mt: 2 }}>
         <Box sx={{ my: 2 }}>
           <Typography component="legend">Overall Rating</Typography>
           <Rating
             value={rating}
             onChange={(event, newValue) => setRating(newValue)}
             size="large"
             sx={{
               '& .MuiRating-iconFilled': {
                 color: '#FF4081'
               }
             }}
           />
         </Box>

         <FormControl component="fieldset" sx={{ my: 2, width: '100%' }}>
           <FormLabel component="legend">Difficulty Level</FormLabel>
           <RadioGroup
             value={difficulty}
             onChange={(e) => setDifficulty(e.target.value)}
           >
             {difficultyLevels.map((level) => (
               <FormControlLabel
                 key={level}
                 value={level}
                 control={<Radio sx={{
                   '&.Mui-checked': {
                     color: '#FF4081'
                   }
                 }}/>}
                 label={level}
               />
             ))}
           </RadioGroup>
         </FormControl>

         <Box sx={{ my: 2 }}>
           <Typography gutterBottom>User Experience</Typography>
           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
             {experienceLabels.map((label) => (
               <Chip
                 key={label}
                 label={label}
                 onClick={() => setExperience(label)}
                 color={experience === label ? "secondary" : "default"}
                 variant={experience === label ? "filled" : "outlined"}
                 sx={{
                   '&.MuiChip-filled': {
                     background: experience === label ? 
                       'linear-gradient(45deg, #37474F, #FF4081)' : 
                       'inherit'
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
           rows={2}
           value={improvement}
           onChange={(e) => setImprovement(e.target.value)}
           sx={{ 
             my: 2,
             '& .MuiOutlinedInput-root': {
               '&.Mui-focused fieldset': {
                 borderColor: '#FF4081'
               }
             }
           }}
         />

         <TextField
           fullWidth
           label="Additional Comments"
           multiline
           rows={3}
           value={comments}
           onChange={(e) => setComments(e.target.value)}
           sx={{ 
             my: 2,
             '& .MuiOutlinedInput-root': {
               '&.Mui-focused fieldset': {
                 borderColor: '#FF4081'
               }
             }
           }}
         />
       </DialogContent>
       <DialogActions sx={{ p: 3 }}>
         <Button 
           onClick={handleSkip}
           sx={{
             color: '#37474F',
             '&:hover': {
               backgroundColor: 'rgba(55, 71, 79, 0.08)'
             }
           }}
         >
           Skip
         </Button>
         <Button
           onClick={handleSubmit}
           variant="contained"
           disabled={!rating}
           sx={{
             background: 'linear-gradient(45deg, #37474F, #FF4081)',
             '&:hover': {
               background: 'linear-gradient(45deg, #455A64, #FF80AB)',
               transform: 'translateY(-2px)',
               boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)'
             },
             '&.Mui-disabled': {
               background: '#E0E0E0'
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
       anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
     >
       <Alert 
         severity={snackbar.severity}
         onClose={() => setSnackbar({ ...snackbar, open: false })}
         sx={{
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