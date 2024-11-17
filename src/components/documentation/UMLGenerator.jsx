import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Download, Description } from '@mui/icons-material';
import mermaid from 'mermaid';

const UMLGenerator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      fontSize: isMobile ? 14 : 16,
    });
  }, [isMobile]);

  const useCaseDiagram = `
    %%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '16px'}}}%%
    flowchart TD
    subgraph System Boundary[Virtual Lab Sound System]
        RegLogin(Register/Login)
        GenWave(Generate Waves)
        AnalSound(Analyze Sound)
        SimDoppler(Simulate Doppler)
        ViewProfile(View Profile)
        GiveFeedback(Give Feedback)
        ViewAnalytics(View Analytics)
        CheckProgress(Check Progress)
        ViewGuides(View Guides)
        SaveResults(Save Results)
        UpdateProgress(Update Progress)

        GenWave --> SaveResults
        AnalSound --> SaveResults
        SimDoppler --> SaveResults
        SaveResults --> UpdateProgress
        GiveFeedback --> UpdateProgress
    end

    Student((:Student))

    Student --> RegLogin
    Student --> GenWave
    Student --> AnalSound
    Student --> SimDoppler
    Student --> ViewProfile
    Student --> GiveFeedback
    Student --> ViewAnalytics
    Student --> CheckProgress
    Student --> ViewGuides

    style System Boundary fill:#f9f9f9,stroke:#666,stroke-width:2px
    style Student fill:#f5f5f5,stroke:#333,stroke-width:2px
    style RegLogin fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style GenWave fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style AnalSound fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style SimDoppler fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style ViewProfile fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style GiveFeedback fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style ViewAnalytics fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style CheckProgress fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style ViewGuides fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style SaveResults fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
    style UpdateProgress fill:#ffe0e0,stroke:#ff4081,stroke-width:2px
  `;

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
      title: 'Use Case Diagram',
      description: 'Shows the interactions between users and system features',
      content: useCaseDiagram
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
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3
      }}
    >
      <Paper 
        sx={{ 
          p: isMobile ? 2 : 3,
          background: 'linear-gradient(135deg, rgba(55, 71, 79, 0.02), rgba(255, 64, 129, 0.02))',
          borderRadius: isMobile ? 2 : 3,
          border: '1px solid rgba(55, 71, 79, 0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: isTablet ? 'none' : 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: isMobile ? 2 : 3,
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left',
            gap: isMobile ? 1 : 2
          }}
        >
          <Description sx={{ 
            fontSize: isMobile ? 32 : 40, 
            color: '#FF4081',
            mr: isMobile ? 0 : 2 
          }} />
          <Typography 
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: 600,
              color: '#37474F',
              background: 'linear-gradient(45deg, #37474F, #FF4081)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            System Documentation
          </Typography>
        </Box>
        
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: isMobile ? 2 : 3,
          overflowX: 'auto'
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            aria-label="documentation tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              '& .MuiTab-root': {
                fontSize: isMobile ? '0.9rem' : '1rem',
                minWidth: isMobile ? 'auto' : 120
              }
            }}
          >
            {diagrams.map((diagram, index) => (
              <Tab 
                key={index} 
                label={diagram.title}
                sx={{
                  '&.Mui-selected': {
                    color: '#FF4081'
                  }
                }}
              />
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
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  sx={{ 
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  {diagram.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  paragraph
                  sx={{
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    mb: isMobile ? 1.5 : 2
                  }}
                >
                  {diagram.description}
                </Typography>
                <Paper 
                  sx={{ 
                    p: isMobile ? 1 : 2, 
                    bgcolor: 'grey.50',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    borderRadius: isMobile ? 1 : 2,
                    maxHeight: isMobile ? '60vh' : '70vh',
                    '& .mermaid': {
                      display: 'flex',
                      justifyContent: 'center',
                      minWidth: activeTab === 0 ? '800px' : 'auto', // Minimum width for use case diagram
                      '& svg': {
                        maxWidth: '100%',
                        height: 'auto'
                      }
                    },
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#888',
                      borderRadius: '4px',
                    }
                  }}
                >
                  <div className="mermaid-diagram">
                    <pre className="mermaid">
                      {diagram.content}
                    </pre>
                  </div>
                </Paper>
                <Button
                  variant="contained"
                  onClick={handleExport}
                  startIcon={<Download />}
                  fullWidth={isMobile}
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    mt: isMobile ? 1.5 : 2,
                    background: 'linear-gradient(45deg, #37474F, #FF4081)',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #455A64, #FF80AB)',
                      transform: isTablet ? 'none' : 'translateY(-2px)',
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
    </Container>
  );
};

export default UMLGenerator;