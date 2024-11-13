// src/components/dashboard/ResultsHistory.jsx
import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { getUserResults } from '../../firebase/results';
import { useAuth } from '../../context/AuthContext';
import { exportToPDF } from '../../utils/pdfExport';

const ResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { user } = useAuth();
  const [exportSnackbar, setExportSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (user) {
          const userResults = await getUserResults(user.uid);
          console.log("Fetched results:", userResults);
          setResults(userResults);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchResults();
  }, [user]);

  const handleViewDetails = (result) => {
    console.log("View Details clicked:", result);
    setSelectedResult(result);
    setDetailOpen(true);
  };

  const handleExport = (result) => {
    console.log("Export clicked:", result);
    try {
      if (!result) {
        console.error('No result to export');
        setExportSnackbar({
          open: true,
          message: 'No data to export',
          severity: 'error'
        });
        return;
      }
      exportToPDF(result, result.experimentType);
      setExportSnackbar({
        open: true,
        message: 'PDF exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setExportSnackbar({
        open: true,
        message: 'Error exporting PDF: ' + error.message,
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Experiment History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Experiment Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No experiments saved yet
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      {result.createdAt ? new Date(result.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>{result.experimentType}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleViewDetails(result)}
                        sx={{ mr: 1 }}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleExport(result)}
                      >
                        Export PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: 1500 }}
      >
        <DialogTitle>
          Experiment Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedResult.experimentType}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(selectedResult.createdAt.seconds * 1000).toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Parameters:
              </Typography>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {JSON.stringify(selectedResult.data, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleExport(selectedResult)}
            variant="outlined"
            color="primary"
          >
            Export PDF
          </Button>
          <Button onClick={() => setDetailOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={exportSnackbar.open}
        autoHideDuration={6000}
        onClose={() => setExportSnackbar({ ...exportSnackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setExportSnackbar({ ...exportSnackbar, open: false })} 
          severity={exportSnackbar.severity}
        >
          {exportSnackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResultsHistory;