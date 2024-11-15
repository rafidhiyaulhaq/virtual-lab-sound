// src/components/experiments/SoundAnalysis.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
 const navigate = useNavigate();
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
     
     analyser.fftSize = 128;
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
 }, []);

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

     canvasCtx.lineWidth = 2;
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
 }, [isRecording]);

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
     navigate('/dashboard', { replace: true });
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

 // JSX Return remains the same...
 return (
   // ... existing JSX ...
   <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
     {/* ... existing JSX code ... */}
   </Container>
 );
};

export default SoundAnalysis;