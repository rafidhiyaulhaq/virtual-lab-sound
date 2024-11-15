// src/components/experiments/WaveGenerator.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 Container, 
 Paper, 
 Typography, 
 Slider, 
 Select, 
 MenuItem, 
 FormControl,
 InputLabel,
 Grid,
 Button,
 Alert,
 Snackbar,
 Box
} from '@mui/material';
import { Help, Science, PlayArrow, Save } from '@mui/icons-material';
import * as d3 from 'd3';
import { useAuth } from '../../context/AuthContext';
import { saveExperimentResult } from '../../firebase/results';
import { updateProgress } from '../../firebase/progress';
import { updateAchievements } from '../../firebase/achievements';
import ExperimentFeedback from '../feedback/ExperimentFeedback';
import { useTutorial } from '../../components/tutorial/TutorialProvider';
import TipsAndGuides from '../../components/tutorial/TipsAndGuides';

const WaveGenerator = () => {
 const navigate = useNavigate();
 const { user } = useAuth();
 const [waveType, setWaveType] = useState('sine');
 const [frequency, setFrequency] = useState(1);
 const [amplitude, setAmplitude] = useState(50);
 const [showFeedback, setShowFeedback] = useState(false);
 const [showGuide, setShowGuide] = useState(false);
 const { startTutorial } = useTutorial();
 const [snackbar, setSnackbar] = useState({
   open: false,
   message: '',
   severity: 'success'
 });

 const svgRef = useRef();

  const generateWaveData = useCallback(() => {
    const points = [];
    const width = 800;
    const steps = 100;

    for (let i = 0; i < steps; i++) {
      const x = (i / steps) * width;
      let y = 0;

      switch (waveType) {
        case 'sine':
          y = amplitude * Math.sin(2 * Math.PI * frequency * (i / steps));
          break;
        case 'square':
          y = amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * (i / steps)));
          break;
        case 'triangle':
          y = amplitude * Math.asin(Math.sin(2 * Math.PI * frequency * (i / steps))) * 2 / Math.PI;
          break;
        default:
          y = 0;
      }
      points.push({ x, y });
    }
    return points;
  }, [waveType, frequency, amplitude]);

  const tutorialSteps = [
    {
      target: '.wave-type-selector',
      content: 'Choose different wave types to see how they look',
      disableBeacon: true
    },
    {
      target: '.frequency-slider',
      content: 'Adjust the frequency to change how fast the wave moves'
    },
    {
      target: '.amplitude-slider',
      content: 'Change the amplitude to make waves bigger or smaller'
    }
  ];

  const saveResult = async () => {
    try {
      const experimentData = {
        waveType,
        frequency,
        amplitude,
        timestamp: new Date().toISOString()
      };
      
      await saveExperimentResult(user.uid, 'wave-generator', experimentData);
      await updateAchievements(user.uid, 'waveGenerator');
      await updateProgress(user.uid, 'waveGenerator');
      setSnackbar({
        open: true,
        message: 'Experiment saved successfully!',
        severity: 'success'
      });
      setShowFeedback(true);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error saving result:', error);
      setSnackbar({
        open: true,
        message: 'Error saving experiment',
        severity: 'error'
      });
    }
  };
  
  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top + height/2})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 800])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-100, 100])
      .range([height/2, -height/2]);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Draw x-axis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height/2})`)
      .call(d3.axisBottom(xScale))
      .attr("color", "#37474F");

    // Draw y-axis
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .attr("color", "#37474F");

    // Draw wave
    const waveData = generateWaveData();
    svg.append("path")
      .datum(waveData)
      .attr("class", "wave")
      .attr("fill", "none")
      .attr("stroke", "#FF4081")
      .attr("stroke-width", 3)
      .attr("d", line);

  }, [generateWaveData]);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenWaveGeneratorTutorial');
    if (!hasSeenTutorial) {
      startTutorial(tutorialSteps);
      localStorage.setItem('hasSeenWaveGeneratorTutorial', 'true');
    }
  }, [startTutorial, tutorialSteps]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Science sx={{ 
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
          Wave Generator
        </Typography>
      </Box>
      
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth className="wave-type-selector">
              <InputLabel 
                sx={{ 
                  color: '#37474F',
                  '&.Mui-focused': {
                    color: '#FF4081'
                  }
                }}
              >
                Wave Type
              </InputLabel>
              <Select
                value={waveType}
                label="Wave Type"
                onChange={(e) => setWaveType(e.target.value)}
                sx={{
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
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography 
              gutterBottom
              sx={{ 
                color: '#37474F',
                fontWeight: 500 
              }}
            >
              Frequency: {frequency} Hz
            </Typography>
            <Slider
              className="frequency-slider"
              value={frequency}
              onChange={(e, newValue) => setFrequency(newValue)}
              min={0.1}
              max={5}
              step={0.1}
              sx={{
                color: '#FF4081',
                '& .MuiSlider-thumb': {
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
          <Grid item xs={12} md={4}>
            <Typography 
              gutterBottom
              sx={{ 
                color: '#37474F',
                fontWeight: 500 
              }}
            >
              Amplitude: {amplitude}
            </Typography>
            <Slider
              className="amplitude-slider"
              value={amplitude}
              onChange={(e, newValue) => setAmplitude(newValue)}
              min={0}
              max={100}
              sx={{
                color: '#FF4081',
                '& .MuiSlider-thumb': {
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
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={saveResult}
          startIcon={<Save />}
          sx={{
            background: 'linear-gradient(45deg, #37474F, #FF4081)',
            '&:hover': {
              background: 'linear-gradient(45deg, #455A64, #FF80AB)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)'
            }
          }}
        >
          Save Result
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

      <Paper 
        sx={{ 
          p: 2,
          background: 'white',
          borderRadius: 3,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(55, 71, 79, 0.12)'
          }
        }}
      >
        <svg ref={svgRef}></svg>
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
        experimentType="wave-generator"
      />

      <TipsAndGuides 
        open={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </Container>
  );
};

export default WaveGenerator;