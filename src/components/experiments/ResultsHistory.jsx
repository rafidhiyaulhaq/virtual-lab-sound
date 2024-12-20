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
  Snackbar,
  IconButton,
  Dialog as ConfirmDialog,
  DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUserResults, deleteExperiment } from '../../firebase/results';
import { useAuth } from '../../context/AuthContext';

const ResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    experimentId: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { user } = useAuth();

  const fetchResults = async () => {
    try {
      if (user) {
        const userResults = await getUserResults(user.uid);
        setResults(userResults);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setSnackbar({
        open: true,
        message: 'Error fetching results',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user]);

  const handleExport = (result) => {
    try {
      if (!result) {
        console.error('No result to export');
        setSnackbar({
          open: true,
          message: 'No data to export',
          severity: 'error'
        });
        return;
      }
      exportToPDF(result, result.experimentType);
      setSnackbar({
        open: true,
        message: 'PDF exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Error exporting PDF: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async (experimentId) => {
    try {
      await deleteExperiment(experimentId);
      await fetchResults(); // Refresh data
      setSnackbar({
        open: true,
        message: 'Experiment deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting experiment:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting experiment',
        severity: 'error'
      });
    }
    setDeleteConfirm({ open: false, experimentId: null });
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
                <TableCell>Parameters</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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
                      {result.data && (
                        <pre style={{ 
                          margin: 0,
                          fontSize: '0.8rem',
                          maxHeight: '60px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleExport(result)}
                        sx={{ mr: 1 }}
                      >
                        Export PDF
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteConfirm({
                          open: true,
                          experimentId: result.id
                        })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, experimentId: null })}
      >
        <DialogTitle>Delete Experiment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this experiment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, experimentId: null })}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(deleteConfirm.experimentId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar untuk notifikasi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResultsHistory;