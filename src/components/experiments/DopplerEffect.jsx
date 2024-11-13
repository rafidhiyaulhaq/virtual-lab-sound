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
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import * as d3 from 'd3';
import { useAuth } from '../../context/AuthContext';
import { saveExperimentResult } from '../../firebase/results';
import { updateProgress } from '../../firebase/progress';
import { updateAchievements } from '../../firebase/achievements';

const DopplerEffect = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceSpeed, setSourceSpeed] = useState(30);
  const [frequency, setFrequency] = useState(440);
  const [observerPosition, setObserverPosition] = useState(50);
  const [soundType, setSoundType] = useState('sine');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const audioContextRef = useRef();
  const oscillatorRef = useRef();
  const animationFrameRef = useRef();
  const svgRef = useRef();
  const graphRef = useRef();

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    setupVisualization();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const setupVisualization = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    svg.append("circle")
      .attr("class", "observer")
      .attr("cx", `${observerPosition}%`)
      .attr("cy", "50%")
      .attr("r", 10)
      .attr("fill", "#2196f3");

    svg.append("text")
      .attr("class", "observer-label")
      .attr("x", `${observerPosition}%`)
      .attr("y", "60%")
      .attr("text-anchor", "middle")
      .text("Observer");

    const graphSvg = d3.select(graphRef.current);
    graphSvg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = graphSvg.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const g = graphSvg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(d3.scaleLinear().range([0, width])));

    g.append("g")
      .call(d3.axisLeft(d3.scaleLinear().domain([0, 1000]).range([height, 0])));

    g.append("path")
      .attr("class", "frequency-line")
      .attr("fill", "none")
      .attr("stroke", "#f50057")
      .attr("stroke-width", 2);
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.select(".observer")
      .attr("cx", `${observerPosition}%`);
    svg.select(".observer-label")
      .attr("x", `${observerPosition}%`);
  }, [observerPosition]);

  const calculateDopplerFrequency = (baseFreq, sourcePos) => {
    const speedOfSound = 343;
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
    const frequencyData = [];
    
    const animate = () => {
      sourcePos = (sourcePos + sourceSpeed/10) % window.innerWidth;
      const dopplerFreq = calculateDopplerFrequency(frequency, sourcePos);
      oscillator.frequency.setValueAtTime(dopplerFreq, audioContextRef.current.currentTime);
      
      const svg = d3.select(svgRef.current);
      svg.selectAll(".source").remove();
      svg.append("circle")
        .attr("class", "source")
        .attr("cx", `${(sourcePos/window.innerWidth) * 100}%`)
        .attr("cy", "50%")
        .attr("r", 8)
        .attr("fill", "#f50057");

      const observerPos = (observerPosition / 100) * window.innerWidth;
      const distance = Math.abs(sourcePos - observerPos);
      const volume = Math.max(0.1, 1 - (distance / window.innerWidth));
      gainNode.gain.setValueAtTime(volume * 0.1, audioContextRef.current.currentTime);

      frequencyData.push({ x: sourcePos, y: dopplerFreq });
      if (frequencyData.length > 100) frequencyData.shift();

      const graphSvg = d3.select(graphRef.current);
      const width = graphSvg.node().getBoundingClientRect().width - 60;
      const height = 150 - 50;

      const line = d3.line()
        .x(d => (d.x / window.innerWidth) * width)
        .y(d => height - ((d.y / 1000) * height));

      graphSvg.select(".frequency-line")
        .datum(frequencyData)
        .attr("d", line);
      
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

    const svg = d3.select(svgRef.current);
    svg.selectAll(".source").remove();

    const graphSvg = d3.select(graphRef.current);
    graphSvg.select(".frequency-line").datum([]).attr("d", "");
  };

  const saveResult = async () => {
    try {
      const experimentData = {
        sourceSpeed,
        frequency,
        observerPosition,
        soundType,
        timestamp: new Date().toISOString()
      };
      
      await saveExperimentResult(user.uid, 'doppler-effect', experimentData);
      await updateAchievements(user.uid, 'dopplerEffect');
      await updateProgress(user.uid, 'dopplerEffect');
      setSnackbar({
        open: true,
        message: 'Experiment configuration saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving result:', error);
      setSnackbar({
        open: true,
        message: 'Error saving experiment configuration',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Doppler Effect Simulator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ width: '100%', height: '150px', mb: 3 }}>
          <svg ref={svgRef} width="100%" height="100%" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
          </svg>
        </Box>

        <Box sx={{ width: '100%', height: '150px', mb: 3 }}>
          <svg ref={graphRef} width="100%" height="100%" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
          </svg>
        </Box>

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

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color={isPlaying ? "secondary" : "primary"}
            onClick={isPlaying ? stopSimulation : startSimulation}
            sx={{ minWidth: 200 }}
          >
            {isPlaying ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={saveResult}
            sx={{ minWidth: 200 }}
          >
            Save Configuration
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Visualization Guide
        </Typography>
        <Typography variant="body1" paragraph>
          • Blue circle: Observer (listener) position
        </Typography>
        <Typography variant="body1" paragraph>
          • Red circle: Moving sound source
        </Typography>
        <Typography variant="body1" paragraph>
          • Graph: Shows real-time frequency changes as source moves
        </Typography>
      </Paper>

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

export default DopplerEffect;