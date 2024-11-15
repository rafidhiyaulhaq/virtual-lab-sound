// src/components/common/Navigation.jsx
import React from 'react';
import {
 AppBar,
 Toolbar,
 Typography,
 Button,
 Box,
 IconButton,
 Menu,
 MenuItem
} from '@mui/material';
import {
 AccountCircle,
 Description as DocIcon,
 Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/auth';

const Navigation = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [anchorEl, setAnchorEl] = React.useState(null);

 const handleMenu = (event) => {
   setAnchorEl(event.currentTarget);
 };

 const handleClose = () => {
   setAnchorEl(null);
 };

 const handleLogout = async () => {
   try {
     await logoutUser();
     navigate('/login', { replace: true });
   } catch (error) {
     console.error('Logout error:', error);
   }
   handleClose();
 };

 const handleProfile = () => {
   navigate('/profile');
   handleClose();
 };

 // Only render navigation when user is logged in
 if (!user) return null;

 return (
   <AppBar 
     position="static"
     sx={{
       background: 'linear-gradient(to right, #37474F, #546E7A)',
       boxShadow: '0 4px 12px rgba(55, 71, 79, 0.15)'
     }}
   >
     <Toolbar>
       {/* Home Icon */}
       <IconButton
         size="large"
         edge="start"
         color="inherit"
         sx={{ 
           mr: 2,
           '&:hover': {
             transform: 'translateY(-2px)',
             transition: 'transform 0.2s ease-in-out'
           }
         }}
         onClick={() => navigate('/dashboard', { replace: true })}
       >
         <HomeIcon />
       </IconButton>

       {/* Title */}
       <Typography 
         variant="h6" 
         component="div" 
         sx={{ 
           flexGrow: 1,
           fontWeight: 500
         }}
       >
         Virtual Lab Sound
       </Typography>

       {/* Navigation Links */}
       <Box sx={{ 
         display: 'flex', 
         alignItems: 'center',
         gap: 1
       }}>
         <Button
           color="inherit"
           onClick={() => navigate('/dashboard', { replace: true })}
           sx={{
             '&:hover': {
               transform: 'translateY(-2px)',
               transition: 'transform 0.2s ease-in-out'
             }
           }}
         >
           Dashboard
         </Button>

         <Button
           color="inherit"
           onClick={() => navigate('/documentation', { replace: true })}
           startIcon={<DocIcon />}
           sx={{
             '&:hover': {
               transform: 'translateY(-2px)',
               transition: 'transform 0.2s ease-in-out'
             }
           }}
         >
           Documentation
         </Button>

         {/* Profile Menu */}
         <IconButton
           size="large"
           aria-label="account of current user"
           aria-controls="menu-appbar"
           aria-haspopup="true"
           onClick={handleMenu}
           color="inherit"
           sx={{
             '&:hover': {
               transform: 'translateY(-2px)',
               transition: 'transform 0.2s ease-in-out'
             }
           }}
         >
           <AccountCircle />
         </IconButton>

         <Menu
           id="menu-appbar"
           anchorEl={anchorEl}
           anchorOrigin={{
             vertical: 'bottom',
             horizontal: 'right',
           }}
           keepMounted
           transformOrigin={{
             vertical: 'top',
             horizontal: 'right',
           }}
           open={Boolean(anchorEl)}
           onClose={handleClose}
           sx={{
             '& .MuiPaper-root': {
               borderRadius: 2,
               minWidth: 180,
               boxShadow: '0 4px 12px rgba(55, 71, 79, 0.15)',
               mt: 1,
             }
           }}
         >
           <MenuItem 
             onClick={handleProfile}
             sx={{
               '&:hover': {
                 backgroundColor: 'rgba(55, 71, 79, 0.04)'
               }
             }}
           >
             Profile
           </MenuItem>
           <MenuItem 
             onClick={handleLogout}
             sx={{
               color: 'error.main',
               '&:hover': {
                 backgroundColor: 'rgba(244, 67, 54, 0.04)'
               }
             }}
           >
             Logout
           </MenuItem>
         </Menu>
       </Box>
     </Toolbar>
   </AppBar>
 );
};

export default Navigation;