import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Help, Speed, PlayArrow, Stop, Save } from '@mui/icons-material';
import * as d3 from 'd3';
import { useAuth } from '../../context/AuthContext';
import { saveExperimentResult } from '../../firebase/results';
import { updateProgress } from '../../firebase/progress';
import { updateAchievements } from '../../firebase/achievements';
import ExperimentFeedback from '../feedback/ExperimentFeedback';
import { useTutorial } from '../../components/tutorial/TutorialProvider';
import TipsAndGuides from '../../components/tutorial/TipsAndGuides';

const DopplerEffect = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceSpeed, setSourceSpeed] = useState(30);
  const [frequency, setFrequency] = useState(440);
  const [observerPosition, setObserverPosition] = useState(50);
  const [soundType, setSoundType] = useState('sine');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { startTutorial } = useTutorial();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Refs
  const audioContextRef = useRef();
  const oscillatorRef = useRef();
  const animationFrameRef = useRef();
  const svgRef = useRef();
  const graphRef = useRef();

  const tutorialSteps = [
    {
      target: '.sound-type-selector',
      content: 'Choose different sound types to hear how they change',
      disableBeacon: true
    },
    {
      target: '.speed-slider',
      content: 'Adjust the source speed to see the Doppler effect'
    },
    {
      target: '.frequency-slider',
      content: 'Change the base frequency of the sound'
    },
    {
      target: '.position-slider',
      content: 'Move the observer position to hear the effect from different points'
    }
  ];

  const setupVisualization = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    svg.append("circle")
      .attr("class", "observer")
      .attr("cx", `${observerPosition}%`)
      .attr("cy", "50%")
      .attr("r", isMobile ? 6 : 10)
      .attr("fill", "#2196f3");

    svg.append("text")
      .attr("class", "observer-label")
      .attr("x", `${observerPosition}%`)
      .attr("y", "60%")
      .attr("text-anchor", "middle")
      .style("font-size", isMobile ? "10px" : "12px")
      .text("Observer");

    const graphSvg = d3.select(graphRef.current);
    graphSvg.selectAll("*").remove();

    const margin = isMobile 
      ? { top: 10, right: 10, bottom: 20, left: 30 }
      : { top: 20, right: 20, bottom: 30, left: 40 };
    
    const width = graphSvg.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = (isMobile ? 120 : 150) - margin.top - margin.bottom;

    const g = graphSvg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(d3.scaleLinear().range([0, width])))
      .style("font-size", isMobile ? "10px" : "12px");

    g.append("g")
      .call(d3.axisLeft(d3.scaleLinear().domain([0, 1000]).range([height, 0])))
      .style("font-size", isMobile ? "10px" : "12px");

    g.append("path")
      .attr("class", "frequency-line")
      .attr("fill", "none")
      .attr("stroke", "#f50057")
      .attr("stroke-width", isMobile ? 1.5 : 2);
  }, [observerPosition, isMobile]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    setupVisualization();
    return () => {
      audioContextRef.current?.close();
    };
  }, [setupVisualization]);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenDopplerEffectTutorial');
    if (!hasSeenTutorial) {
      startTutorial(tutorialSteps);
      localStorage.setItem('hasSeenDopplerEffectTutorial', 'true');
    }
  }, [startTutorial, tutorialSteps]);

  const calculateDopplerFrequency = useCallback((baseFreq, sourcePos) => {
    const speedOfSound = 343;
    const observerPos = (observerPosition / 100) * (isMobile ? window.innerWidth * 0.9 : window.innerWidth);
    const sourceVelocity = sourceSpeed * (sourcePos > observerPos ? -1 : 1);
    return baseFreq * ((speedOfSound) / (speedOfSound + sourceVelocity));
  }, [observerPosition, sourceSpeed, isMobile]);

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
      const containerWidth = isMobile ? window.innerWidth * 0.9 : window.innerWidth;
      sourcePos = (sourcePos + sourceSpeed/10) % containerWidth;
      const dopplerFreq = calculateDopplerFrequency(frequency, sourcePos);
      oscillator.frequency.setValueAtTime(dopplerFreq, audioContextRef.current.currentTime);
      
      const svg = d3.select(svgRef.current);
      svg.selectAll(".source").remove();
      svg.append("circle")
        .attr("class", "source")
        .attr("cx", `${(sourcePos/containerWidth) * 100}%`)
        .attr("cy", "50%")
        .attr("r", isMobile ? 6 : 8)
        .attr("fill", "#f50057");

      const observerPos = (observerPosition / 100) * containerWidth;
      const distance = Math.abs(sourcePos - observerPos);
      const volume = Math.max(0.1, 1 - (distance / containerWidth));
      gainNode.gain.setValueAtTime(volume * 0.1, audioContextRef.current.currentTime);

      frequencyData.push({ x: sourcePos, y: dopplerFreq });
      if (frequencyData.length > (isMobile ? 50 : 100)) frequencyData.shift();

      const graphSvg = d3.select(graphRef.current);
      const width = graphSvg.node().getBoundingClientRect().width - (isMobile ? 40 : 60);
      const height = (isMobile ? 120 : 150) - (isMobile ? 30 : 50);

      const line = d3.line()
        .x(d => (d.x / containerWidth) * width)
        .y(d => height - ((d.y / 1000) * height))
        .curve(d3.curveMonotoneX);

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
        message: 'Experiment saved successfully!',
        severity: 'success'
      });
      setShowFeedback(true);
    } catch (error) {
      console.error('Error saving result:', error);
      setSnackbar({
        open: true,
        message: 'Error saving experiment',
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
        <Speed sx={{ 
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
          Doppler Effect Simulator
        </Typography>
      </Box>

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
        <Box 
          sx={{ 
            width: '100%', 
            height: isMobile ? '120px' : '150px', 
            mb: isMobile ? 2 : 3,
            border: '1px solid rgba(55, 71, 79, 0.1)',
            borderRadius: isMobile ? 1 : 2,
            overflow: 'hidden'
          }}
        >
          <svg ref={svgRef} width="100%" height="100%"></svg>
        </Box>

        <Box 
          sx={{ 
            width: '100%', 
            height: isMobile ? '120px' : '150px', 
            mb: isMobile ? 2 : 3,
            border: '1px solid rgba(55, 71, 79, 0.1)',
            borderRadius: isMobile ? 1 : 2,
            overflow: 'hidden'
          }}
        >
          <svg ref={graphRef} width="100%" height="100%"></svg>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography 
              gutterBottom
              sx={{ 
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 500,
                color: '#37474F'
              }}
            >
              Source Speed: {sourceSpeed} m/s
            </Typography>
            <Slider
              className="speed-slider"
              value={sourceSpeed}
              onChange={(e, newValue) => setSourceSpeed(newValue)}
              min={0}
              max={100}
              step={1}
              disabled={isPlaying}
              size={isMobile ? "small" : "medium"}
              sx={{
                color: '#FF4081',
                '& .MuiSlider-thumb': {
                  width: isMobile ? 20 : 24,
                  height: isMobile ? 20 : 24,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(255, 64, 129, 0.16)'
                  }
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(45deg, #37474F, #FF4081)'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography 
              gutterBottom
              sx={{ 
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 500,
                color: '#37474F'
              }}
            >
              Base Frequency: {frequency} Hz
            </Typography>
            <Slider
              className="frequency-slider"
              value={frequency}
              onChange={(e, newValue) => setFrequency(newValue)}
              min={220}
              max={880}
              step={1}
              disabled={isPlaying}
              size={isMobile ? "small" : "medium"}
              sx={{
                color: '#FF4081',
                '& .MuiSlider-thumb': {
                  width: isMobile ? 20 : 24,
                  height: isMobile ? 20 : 24,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(255, 64, 129, 0.16)'
                  }
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(45deg, #37474F, #FF4081)'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography 
              gutterBottom
              sx={{ 
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: 500,
                color: '#37474F'
              }}
            >
              Observer Position: {observerPosition}%
            </Typography>
            <Slider
              className="position-slider"
              value={observerPosition}
              onChange={(e, newValue) => setObserverPosition(newValue)}
              min={0}
              max={100}
              step={1}
              size={isMobile ? "small" : "medium"}
              sx={{
                color: '#FF4081',
                '& .MuiSlider-thumb': {
                  width: isMobile ? 20 : 24,
                  height: isMobile ? 20 : 24,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(255, 64, 129, 0.16)'
                  }
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(45deg, #37474F, #FF4081)'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <FormControl 
              fullWidth 
              className="sound-type-selector"
              size={isMobile ? "small" : "medium"}
            >
              <InputLabel 
                sx={{ 
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: '#37474F',
                  '&.Mui-focused': {
                    color: '#FF4081'
                  }
                }}
              >
                Sound Type
              </InputLabel>
              <Select
                value={soundType}
                label="Sound Type"
                onChange={(e) => setSoundType(e.target.value)}
                disabled={isPlaying}
                sx={{
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(55, 71, 79, 0.2)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 64, 129, 0.3)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF4081'
                  }
                }}
              >
                <MenuItem value="sine">Sine Wave</MenuItem>
                <MenuItem value="square">Square Wave</MenuItem>
                <MenuItem value="triangle">Triangle Wave</MenuItem>
                <MenuItem value="sawtooth">Sawtooth Wave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ 
          mt: isMobile ? 2 : 3, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 2,
          justifyContent: 'center' 
        }}>
          <Button
            fullWidth={isMobile}
            variant="contained"
            color={isPlaying ? "secondary" : "primary"}
            onClick={isPlaying ? stopSimulation : startSimulation}
            size={isMobile ? "medium" : "large"}
            startIcon={isPlaying ? <Stop /> : <PlayArrow />}
            sx={{
              background: isPlaying 
                ? 'linear-gradient(45deg, #FF4081, #FF80AB)'
                : 'linear-gradient(45deg, #37474F, #546E7A)',
              fontSize: isMobile ? '0.9rem' : '1rem',
              '&:hover': {
                background: isPlaying
                  ? 'linear-gradient(45deg, #F50057, #FF4081)'
                  : 'linear-gradient(45deg, #455A64, #37474F)',
                transform: isTablet ? 'none' : 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(55, 71, 79, 0.2)'
              }
            }}
          >
            {isPlaying ? 'Stop Simulation' : 'Start Simulation'}
          </Button>
          <Button
            fullWidth={isMobile}
            variant="contained"
            onClick={saveResult}
            startIcon={<Save />}
            size={isMobile ? "medium" : "large"}
            disabled={!isPlaying}
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
            Save Result
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
        experimentType="doppler-effect"
      />

      <TipsAndGuides 
        open={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </Container>
  );
};

export default DopplerEffect;