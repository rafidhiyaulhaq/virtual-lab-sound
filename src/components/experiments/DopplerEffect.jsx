// src/components/experiments/DopplerEffect.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Slider,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

const DopplerEffect = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceSpeed, setSourceSpeed] = useState(30); // m/s
  const [frequency, setFrequency] = useState(440); // Hz
  const [observerPosition, setObserverPosition] = useState(50); // %
  const [soundType, setSoundType] = useState('sine');
  
  const audioContextRef = useRef();
  const oscillatorRef = useRef();
  const animationFrameRef = useRef();

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Calculate Doppler shifted frequency
  const calculateDopplerFrequency = (baseFreq, sourcePos) => {
    const speedOfSound = 343; // m/s
    const observerPos = (observerPosition / 100) * window.innerWidth;
    const sourceVelocity = sourceSpeed * (sourcePos > observerPos ? -1 : 1);
    
    return baseFreq * ((speedOfSound) / (speedOfSound + sourceVelocity));
  };

  const startSimulation = () => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = soundType;
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillatorRef.current = oscillator;
    oscillator.start();
    
    let sourcePos = 0;
    const animate = () => {
      sourcePos = (sourcePos + sourceSpeed/10) % window.innerWidth;
      const dopplerFreq = calculateDopplerFrequency(frequency, sourcePos);
      oscillator.frequency.setValueAtTime(dopplerFreq, audioContextRef.current.currentTime);
      
      // Update volume based on distance
      const observerPos = (observerPosition / 100) * window.innerWidth;
      const distance = Math.abs(sourcePos - observerPos);
      const volume = Math.max(0.1, 1 - (distance / window.innerWidth));
      gainNode.gain.setValueAtTime(volume * 0.1, audioContextRef.current.currentTime);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    setIsPlaying(true);
  };

  const stopSimulation = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Doppler Effect Simulator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
              Source Speed: {sourceSpeed} m/s
            </Typography>
            <Slider
              value={sourceSpeed}
              onChange={(e, newValue) => setSourceSpeed(newValue)}
              min={0}
              max={100}
              step={1}
              disabled={isPlaying}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
              Base Frequency: {frequency} Hz
            </Typography>
            <Slider
              value={frequency}
              onChange={(e, newValue) => setFrequency(newValue)}
              min={220}
              max={880}
              step={1}
              disabled={isPlaying}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
              Observer Position: {observerPosition}%
            </Typography>
            <Slider
              value={observerPosition}
              onChange={(e, newValue) => setObserverPosition(newValue)}
              min={0}
              max={100}
              step={1}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sound Type</InputLabel>
              <Select
                value={soundType}
                label="Sound Type"
                onChange={(e) => setSoundType(e.target.value)}
                disabled={isPlaying}
              >
                <MenuItem value="sine">Sine Wave</MenuItem>
                <MenuItem value="square">Square Wave</MenuItem>
                <MenuItem value="triangle">Triangle Wave</MenuItem>
                <MenuItem value="sawtooth">Sawtooth Wave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color={isPlaying ? "secondary" : "primary"}
            onClick={isPlaying ? stopSimulation : startSimulation}
            sx={{ minWidth: 200 }}
          >
            {isPlaying ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          How it works
        </Typography>
        <Typography variant="body1" paragraph>
          This simulator demonstrates the Doppler effect - the change in frequency of a sound wave 
          for an observer moving relative to its source. As the source moves relative to the observer:
        </Typography>
        <ul>
          <li>The frequency increases as the source approaches</li>
          <li>The frequency decreases as the source moves away</li>
          <li>The volume changes based on distance</li>
        </ul>
      </Paper>
    </Container>
  );
};

export default DopplerEffect;