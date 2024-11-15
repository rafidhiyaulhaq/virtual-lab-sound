// src/components/profile/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 Container,
 Paper,
 Typography,
 TextField,
 Button,
 Box,
 Avatar,
 Grid,
 Alert,
 Snackbar,
 CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, getUserProfile } from '../../firebase/profile';

const UserProfile = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [profile, setProfile] = useState({
   displayName: '',
   institution: '',
   role: ''
 });
 const [isLoading, setIsLoading] = useState(true);
 const [snackbar, setSnackbar] = useState({
   open: false,
   message: '',
   severity: 'success'
 });

 useEffect(() => {
   const fetchProfile = async () => {
     if (user) {
       try {
         const userProfile = await getUserProfile(user.uid);
         if (userProfile) {
           setProfile(userProfile);
         }
       } catch (error) {
         console.error('Error fetching profile:', error);
         setSnackbar({
           open: true,
           message: 'Error fetching profile',
           severity: 'error'
         });
       } finally {
         setIsLoading(false);
       }
     }
   };

   fetchProfile();
 }, [user]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     await updateUserProfile(user.uid, profile);
     setSnackbar({
       open: true,
       message: 'Profile updated successfully!',
       severity: 'success'
     });
     navigate('/dashboard', { replace: true });
   } catch (error) {
     console.error('Error updating profile:', error);
     setSnackbar({
       open: true,
       message: 'Error updating profile',
       severity: 'error'
     });
   }
 };

 const handleChange = (e) => {
   setProfile({
     ...profile,
     [e.target.name]: e.target.value
   });
 };

 const handleBack = () => {
   navigate('/dashboard', { replace: true });
 };

 if (isLoading) {
   return (
     <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
       <CircularProgress />
     </Box>
   );
 }

 return (
   <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
     <Paper sx={{ p: 4 }}>
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
         <Button
           startIcon={<ArrowBack />}
           onClick={handleBack}
           sx={{ mr: 2 }}
         >
           Back to Dashboard
         </Button>
         <Typography variant="h4" gutterBottom>
           User Profile
         </Typography>
       </Box>

       <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
         <Avatar
           sx={{ width: 100, height: 100, mr: 3 }}
           alt={profile.displayName || user?.email}
         />
         <Box>
           <Typography variant="body1" color="text.secondary">
             {user?.email}
           </Typography>
         </Box>
       </Box>

       <form onSubmit={handleSubmit}>
         <Grid container spacing={3}>
           <Grid item xs={12}>
             <TextField
               fullWidth
               label="Display Name"
               name="displayName"
               value={profile.displayName}
               onChange={handleChange}
             />
           </Grid>
           <Grid item xs={12}>
             <TextField
               fullWidth
               label="Institution"
               name="institution"
               value={profile.institution}
               onChange={handleChange}
             />
           </Grid>
           <Grid item xs={12}>
             <TextField
               fullWidth
               label="Role"
               name="role"
               value={profile.role}
               onChange={handleChange}
             />
           </Grid>
           <Grid item xs={12}>
             <Button
               type="submit"
               variant="contained"
               color="primary"
               size="large"
               sx={{
                 background: 'linear-gradient(45deg, #37474F, #FF4081)',
                 '&:hover': {
                   background: 'linear-gradient(45deg, #455A64, #FF80AB)',
                   transform: 'translateY(-2px)',
                   boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)'
                 }
               }}
             >
               Save Profile
             </Button>
           </Grid>
         </Grid>
       </form>
     </Paper>

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
   </Container>
 );
};

export default UserProfile;