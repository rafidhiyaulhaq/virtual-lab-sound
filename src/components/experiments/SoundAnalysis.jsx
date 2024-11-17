import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Snackbar,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Help,
  GraphicEq,
  Mic,
  Stop,
  Download,
  Save
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { saveExperimentResult } from '../../firebase/results';
import { updateProgress } from '../../firebase/progress';
import { updateAchievements } from '../../firebase/achievements';
import ExperimentFeedback from '../feedback/ExperimentFeedback';
import { useTutorial } from '../../components/tutorial/TutorialProvider';
import TipsAndGuides from '../../components/tutorial/TipsAndGuides';

const SoundAnalysis = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState([]);
  const [error, setError] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { startTutorial } = useTutorial();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);

  const tutorialSteps = useMemo(() => [
    {
      target: '.record-button',
      content: 'Click to start recording audio for analysis',
      disableBeacon: true
    },
    {
      target: '.visualization-canvas',
      content: 'Watch the frequency spectrum in real-time'
    },
    {
      target: '.download-button',
      content: 'Download your recorded audio for further analysis'
    }
  ], []);

  const setupAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
      
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = isMobile ? 64 : 128; // Smaller for mobile
      analyser.smoothingTimeConstant = 0.6;
      analyser.minDecibels = -70;
      analyser.maxDecibels = -10;
      
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioData(prevData => [...prevData, e.data]);
        }
      };
    } catch (err) {
      setError('Error accessing microphone: ' + err.message);
    }
  }, [isMobile]);

  const drawVisualization = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !isRecording) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'white';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = isMobile ? 1.5 : 2;
      canvasCtx.strokeStyle = '#FF4081';
      canvasCtx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  }, [isRecording, isMobile]);

  useEffect(() => {
    setupAudioContext();
    const hasSeenTutorial = localStorage.getItem('hasSeenSoundAnalysisTutorial');
    if (!hasSeenTutorial) {
      startTutorial(tutorialSteps);
      localStorage.setItem('hasSeenSoundAnalysisTutorial', 'true');
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setupAudioContext, startTutorial, tutorialSteps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    }
  }, []);

  const startRecording = async () => {
    try {
      if (!analyserRef.current) {
        await setupAudioContext();
      }
      setIsRecording(true);
      setAudioData([]);
      mediaRecorderRef.current?.start(100);
      drawVisualization();
    } catch (error) {
      setError('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveResult = async () => {
    try {
      const experimentData = {
        recordingDuration: audioData.length > 0 ? 'Recording available' : 'No recording',
        timestamp: new Date().toISOString(),
        hasAudioData: audioData.length > 0
      };
      
      await saveExperimentResult(user.uid, 'sound-analysis', experimentData);
      await updateAchievements(user.uid, 'soundAnalysis');
      await updateProgress(user.uid, 'soundAnalysis');
      setSnackbar({
        open: true,
        message: 'Analysis saved successfully!',
        severity: 'success'
      });
      setShowFeedback(true);
    } catch (error) {
      console.error('Error saving result:', error);
      setSnackbar({
        open: true,
        message: 'Error saving analysis',
        severity: 'error'
      });
    }
  };

  const downloadRecording = () => {
    if (audioData.length === 0) return;
    
    const blob = new Blob(audioData, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sound-recording.webm';
    a.click();
    URL.revokeObjectURL(url);
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
        <GraphicEq sx={{ 
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
          Sound Analysis
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: isMobile ? 1.5 : 2,
            borderRadius: isMobile ? 1 : 2,
            backgroundColor: 'rgba(255, 64, 129, 0.1)',
            color: '#37474F',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: isMobile ? 2 : 3, 
          mb: isMobile ? 2 : 3,
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
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12}>
            <Box 
              sx={{ 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: isMobile ? 1 : 2,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(55, 71, 79, 0.08)',
                height: isMobile ? '150px' : '200px'
              }}
            >
              <canvas
                ref={canvasRef}
                className="visualization-canvas"
                style={{ 
                  width: '100%',
                  height: '100%'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              gap: isMobile ? 1 : 2, 
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Button
                fullWidth={isMobile}
                variant="contained"
                color={isRecording ? "secondary" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
                className="record-button"
                startIcon={isRecording ? <Stop /> : <Mic />}
                size={isMobile ? "medium" : "large"}
                sx={{
                  background: isRecording 
                    ? 'linear-gradient(45deg, #FF4081, #FF80AB)'
                    : 'linear-gradient(45deg, #37474F, #546E7A)',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  '&:hover': {
                    background: isRecording
                      ? 'linear-gradient(45deg, #F50057, #FF4081)'
                      : 'linear-gradient(45deg, #455A64, #37474F)',
                    transform: isTablet ? 'none' : 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(55, 71, 79, 0.2)'
                  }
                }}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <Button
                fullWidth={isMobile}
                variant="outlined"
                onClick={downloadRecording}
                disabled={audioData.length === 0}
                className="download-button"
                startIcon={<Download />}
                size={isMobile ? "medium" : "large"}
                sx={{
                  borderColor: '#FF4081',
                  color: '#FF4081',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  '&:hover': {
                    borderColor: '#FF80AB',
                    backgroundColor: 'rgba(255, 64, 129, 0.05)',
                    transform: isTablet ? 'none' : 'translateY(-2px)'
                  },
                  '&.Mui-disabled': {
                    borderColor: 'rgba(55, 71, 79, 0.2)',
                    color: 'rgba(55, 71, 79, 0.4)'
                  }
                }}
              >
                Download Recording
              </Button>
              <Button
                fullWidth={isMobile}
                variant="contained"
                onClick={saveResult}
                disabled={!audioData.length}
                startIcon={<Save />}
                size={isMobile ? "medium" : "large"}
                sx={{
                  background: 'linear-gradient(45deg, #37474F, #FF4081)',
                  fontSize: isMobile ? '0.9rem' : '1rem',
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
                Save Analysis
              </Button>
              <Button
                fullWidth={isMobile}
                variant="outlined"
                onClick={() => setShowGuide(true)}
                startIcon={<Help />}
                size={isMobile ? "medium" : "large"}
                sx={{
                  borderColor: '#FF4081',
                  color: '#FF4081',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  '&:hover': {
                    borderColor: '#FF80AB',
                    backgroundColor: 'rgba(255, 64, 129, 0.05)',
                    transform: isTablet ? 'none' : 'translateY(-2px)'
                  }
                }}
              >
                Help & Tips
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {isRecording && (
        <Paper 
          sx={{ 
            p: isMobile ? 1.5 : 2,
            background: 'linear-gradient(135deg, rgba(255, 64, 129, 0.05), rgba(55, 71, 79, 0.05))',
            borderRadius: isMobile ? 1 : 2
          }}
        >
          <Typography 
            variant={isMobile ? "body2" : "body1"}
            sx={{ 
              color: '#37474F',
              fontWeight: 500,
              mb: isMobile ? 0.5 : 1
            }}
          >
            Recording in progress...
          </Typography>
          <LinearProgress 
            sx={{
              height: isMobile ? 4 : 6,
              borderRadius: 3,
              backgroundColor: 'rgba(55, 71, 79, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #37474F, #FF4081)',
                borderRadius: 3
              }
            }}
          />
        </Paper>
      )}

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
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
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

      <ExperimentFeedback
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        experimentType="sound-analysis"
      />

      <TipsAndGuides 
        open={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </Container>
  );
};

export default SoundAnalysis;