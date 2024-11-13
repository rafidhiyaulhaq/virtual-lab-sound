// src/components/experiments/SoundAnalysis.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Snackbar,
  Box
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

  const canvasRef = useRef();
  const analyserRef = useRef();
  const mediaRecorderRef = useRef();
  const animationFrameRef = useRef();

  const tutorialSteps = [
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
  ];

  const setupAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 2048;
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
  }, []);

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

  const drawFrequencyData = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(255, 255, 255)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2;
        const hue = (barHeight / 2) * 0.7; // Creates color gradient
        canvasCtx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setAudioData([]);
    mediaRecorderRef.current?.start();
    drawFrequencyData();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3
        }}
      >
        <GraphicEq sx={{ 
          fontSize: 40, 
          color: '#FF4081',
          mr: 2 
        }} />
        <Typography 
          variant="h4" 
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
            mb: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 64, 129, 0.1)',
            color: '#37474F'
          }}
        >
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(55, 71, 79, 0.02), rgba(255, 64, 129, 0.02))',
          borderRadius: 3,
          border: '1px solid rgba(55, 71, 79, 0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box 
              sx={{ 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 8px rgba(55, 71, 79, 0.08)'
              }}
            >
              <canvas
                ref={canvasRef}
                className="visualization-canvas"
                width={800}
                height={200}
                style={{ 
                  width: '100%',
                  height: '200px'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color={isRecording ? "secondary" : "primary"}
                onClick={isRecording ? stopRecording : startRecording}
                className="record-button"
                startIcon={isRecording ? <Stop /> : <Mic />}
                sx={{
                  background: isRecording 
                    ? 'linear-gradient(45deg, #FF4081, #FF80AB)'
                    : 'linear-gradient(45deg, #37474F, #546E7A)',
                  '&:hover': {
                    background: isRecording
                      ? 'linear-gradient(45deg, #F50057, #FF4081)'
                      : 'linear-gradient(45deg, #455A64, #37474F)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(55, 71, 79, 0.2)'
                  }
                }}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <Button
                variant="outlined"
                onClick={downloadRecording}
                disabled={audioData.length === 0}
                className="download-button"
                startIcon={<Download />}
                sx={{
                  borderColor: '#FF4081',
                  color: '#FF4081',
                  '&:hover': {
                    borderColor: '#FF80AB',
                    backgroundColor: 'rgba(255, 64, 129, 0.05)',
                    transform: 'translateY(-2px)'
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
                variant="contained"
                onClick={saveResult}
                disabled={!audioData.length}
                startIcon={<Save />}
                sx={{
                  background: 'linear-gradient(45deg, #37474F, #FF4081)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #455A64, #FF80AB)',
                    transform: 'translateY(-2px)',
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
                variant="outlined"
                onClick={() => setShowGuide(true)}
                startIcon={<Help />}
                sx={{
                  borderColor: '#FF4081',
                  color: '#FF4081',
                  '&:hover': {
                    borderColor: '#FF80AB',
                    backgroundColor: 'rgba(255, 64, 129, 0.05)',
                    transform: 'translateY(-2px)'
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
            p: 2,
            background: 'linear-gradient(135deg, rgba(255, 64, 129, 0.05), rgba(55, 71, 79, 0.05))',
            borderRadius: 2
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#37474F',
              fontWeight: 500,
              mb: 1
            }}
          >
            Recording in progress...
          </Typography>
          <LinearProgress 
            sx={{
              height: 6,
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{
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