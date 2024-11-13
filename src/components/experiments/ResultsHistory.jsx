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
  CircularProgress
} from '@mui/material';
import { getUserResults } from '../../firebase/results';
import { useAuth } from '../../context/AuthContext';

const ResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (user) {
          const userResults = await getUserResults(user.uid);
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
    setSelectedResult(result);
    setDetailOpen(true);
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
                      >
                        View Details
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
          <Button onClick={() => setDetailOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResultsHistory;