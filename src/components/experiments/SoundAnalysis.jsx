// src/components/experiments/SoundAnalysis.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  LinearProgress,
  Snackbar
} from '@mui/material';
import * as d3 from 'd3';
import { useAuth } from '../../context/AuthContext';
import { saveExperimentResult } from '../../firebase/results';
import { updateProgress } from '../../firebase/progress';

const SoundAnalysis = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState([]);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const canvasRef = useRef();
  const analyserRef = useRef();
  const mediaRecorderRef = useRef();

  useEffect(() => {
    setupAudioContext();
  }, []);

  const setupAudioContext = async () => {
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
  };

  const drawFrequencyData = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(255, 255, 255)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2;
        canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  };

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
      await updateProgress(user.uid, 'soundAnalysis');
      setSnackbar({
        open: true,
        message: 'Sound analysis saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving result:', error);
      setSnackbar({
        open: true,
        message: 'Error saving sound analysis',
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
      <Typography variant="h4" gutterBottom>
        Sound Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              style={{ border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color={isRecording ? "secondary" : "primary"}
              onClick={isRecording ? stopRecording : startRecording}
              sx={{ mr: 2 }}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            <Button
              variant="outlined"
              onClick={downloadRecording}
              disabled={audioData.length === 0}
              sx={{ mr: 2 }}
            >
              Download Recording
            </Button>
            <Button
              variant="contained"
              onClick={saveResult}
              disabled={!audioData.length}
              color="success"
            >
              Save Analysis
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isRecording && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Recording in progress...
          </Typography>
          <LinearProgress />
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SoundAnalysis;