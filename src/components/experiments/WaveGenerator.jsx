// src/components/experiments/WaveGenerator.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  Button 
} from '@mui/material';
import * as d3 from 'd3';

const WaveGenerator = () => {
  const [waveType, setWaveType] = useState('sine');
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(50);
  const svgRef = useRef();

  const generateWaveData = () => {
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
      .call(d3.axisBottom(xScale));

    // Draw y-axis
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    // Draw wave
    const waveData = generateWaveData();
    svg.append("path")
      .datum(waveData)
      .attr("class", "wave")
      .attr("fill", "none")
      .attr("stroke", "#2196f3")
      .attr("stroke-width", 2)
      .attr("d", line);

  }, [waveType, frequency, amplitude]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Wave Generator
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Wave Type</InputLabel>
              <Select
                value={waveType}
                label="Wave Type"
                onChange={(e) => setWaveType(e.target.value)}
              >
                <MenuItem value="sine">Sine Wave</MenuItem>
                <MenuItem value="square">Square Wave</MenuItem>
                <MenuItem value="triangle">Triangle Wave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>
              Frequency: {frequency} Hz
            </Typography>
            <Slider
              value={frequency}
              onChange={(e, newValue) => setFrequency(newValue)}
              min={0.1}
              max={5}
              step={0.1}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>
              Amplitude: {amplitude}
            </Typography>
            <Slider
              value={amplitude}
              onChange={(e, newValue) => setAmplitude(newValue)}
              min={0}
              max={100}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <svg ref={svgRef}></svg>
      </Paper>
    </Container>
  );
};

export default WaveGenerator;