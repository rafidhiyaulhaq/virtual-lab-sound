// src/components/documentation/UMLGenerator.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 Container,
 Paper,
 Typography,
 Tabs,
 Tab,
 Box,
 Button,
 Alert,
 Snackbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import mermaid from 'mermaid';

const UMLGenerator = () => {
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState(0);
 const [snackbar, setSnackbar] = useState({
   open: false,
   message: '',
   severity: 'success'
 });

 useEffect(() => {
   mermaid.initialize({
     startOnLoad: true,
     theme: 'default',
     securityLevel: 'loose',
   });
 }, []);

 // Class Diagram
 const classDiagram = `
   classDiagram
     class User {
       +String uid
       +String email
       +String displayName
       +String institution
       +String role
     }
     
     class Experiment {
       +String id
       +String userId
       +String experimentType
       +Object data
       +Timestamp createdAt
     }
     
     class Progress {
       +String userId
       +Number waveGeneratorCount
       +Number soundAnalysisCount
       +Number dopplerEffectCount
       +Timestamp lastUpdated
     }
     
     class Feedback {
       +String id
       +String userId
       +String experimentType
       +Number rating
       +String comments
       +Timestamp createdAt
     }

     User "1" -- "*" Experiment : performs
     User "1" -- "1" Progress : tracks
     User "1" -- "*" Feedback : provides
 `;

 // Sequence Diagram
 const sequenceDiagram = `
   sequenceDiagram
     participant U as User
     participant A as Auth
     participant E as Experiment
     participant D as Database
     
     U->>A: Login/Register
     A->>U: Authentication Token
     U->>E: Perform Experiment
     E->>D: Save Results
     D->>E: Confirm Save
     E->>U: Show Feedback Form
     U->>D: Submit Feedback
     D->>U: Update Progress
 `;

 // Activity Diagram
 const activityDiagram = `
   stateDiagram-v2
     [*] --> Login
     Login --> Dashboard
     Dashboard --> WaveGenerator
     Dashboard --> SoundAnalysis
     Dashboard --> DopplerEffect
     
     WaveGenerator --> SaveResults
     SoundAnalysis --> SaveResults
     DopplerEffect --> SaveResults
     
     SaveResults --> Feedback
     Feedback --> UpdateProgress
     UpdateProgress --> Dashboard
     
     Dashboard --> UserProfile
     UserProfile --> Dashboard
     
     Dashboard --> [*]
 `;

 const diagrams = [
   {
     title: 'Class Diagram',
     description: 'Shows the structure of the application classes and their relationships',
     content: classDiagram
   },
   {
     title: 'Sequence Diagram',
     description: 'Illustrates the interaction between different components',
     content: sequenceDiagram
   },
   {
     title: 'Activity Diagram',
     description: 'Displays the flow of activities in the application',
     content: activityDiagram
   }
 ];

 useEffect(() => {
   mermaid.contentLoaded();
 }, [activeTab]);

 const handleExport = async () => {
   try {
     const element = document.querySelector('.mermaid-diagram');
     const svg = await mermaid.render('export', diagrams[activeTab].content);
     
     const svgBlob = new Blob([svg.svg], { type: 'image/svg+xml;charset=utf-8' });
     const url = URL.createObjectURL(svgBlob);
     
     const link = document.createElement('a');
     link.href = url;
     link.download = `${diagrams[activeTab].title.toLowerCase().replace(' ', '-')}.svg`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);

     setSnackbar({
       open: true,
       message: 'Diagram exported successfully!',
       severity: 'success'
     });
   } catch (error) {
     console.error('Error exporting diagram:', error);
     setSnackbar({
       open: true,
       message: 'Error exporting diagram',
       severity: 'error'
     });
   }
 };

 const handleBack = () => {
   navigate('/dashboard', { replace: true });
 };

 return (
   <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
     <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
       <Button
         startIcon={<ArrowBack />}
         onClick={handleBack}
         sx={{ mr: 2 }}
       >
         Back to Dashboard
       </Button>
       <Typography variant="h4" gutterBottom>
         System Documentation
       </Typography>
     </Box>

     <Paper sx={{ p: 3 }}>
       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
         <Tabs
           value={activeTab}
           onChange={(e, newValue) => setActiveTab(newValue)}
           aria-label="documentation tabs"
         >
           {diagrams.map((diagram, index) => (
             <Tab key={index} label={diagram.title} />
           ))}
         </Tabs>
       </Box>

       {diagrams.map((diagram, index) => (
         <div
           key={index}
           role="tabpanel"
           hidden={activeTab !== index}
         >
           {activeTab === index && (
             <Box>
               <Typography variant="h6" gutterBottom>
                 {diagram.title}
               </Typography>
               <Typography variant="body2" color="text.secondary" paragraph>
                 {diagram.description}
               </Typography>
               <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                 <div className="mermaid-diagram">
                   <pre className="mermaid">
                     {diagram.content}
                   </pre>
                 </div>
               </Paper>
               <Button
                 variant="contained"
                 onClick={handleExport}
                 sx={{ 
                   mt: 2,
                   background: 'linear-gradient(45deg, #37474F, #FF4081)',
                   '&:hover': {
                     background: 'linear-gradient(45deg, #455A64, #FF80AB)',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)'
                   }
                 }}
               >
                 Export Diagram
               </Button>
             </Box>
           )}
         </div>
       ))}
     </Paper>

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
   </Container>
 );
};

export default UMLGenerator;