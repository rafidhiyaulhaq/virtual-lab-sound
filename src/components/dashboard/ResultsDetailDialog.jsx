// src/components/dashboard/ResultsDetailDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { exportToPDF } from '../../utils/pdfExport';

const ResultsDetailDialog = ({ open, onClose, result }) => {
  const handleExport = () => {
    try {
      exportToPDF(result, result.experimentType);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  if (!result) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {result.experimentType} Results
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Date:
          </Typography>
          <Typography>
            {result.createdAt?.seconds ? 
              new Date(result.createdAt.seconds * 1000).toLocaleString() : 
              'N/A'}
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.data && Object.entries(result.data).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{value.toString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleExport}
          startIcon={<Download />}
        >
          Export PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultsDetailDialog;