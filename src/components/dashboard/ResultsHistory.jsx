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
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Collapse
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getUserResults, deleteExperiment } from '../../firebase/results';
import { useAuth } from '../../context/AuthContext';
import ResultsDetailDialog from './ResultsDetailDialog';

const MobileResultCard = ({ result, onView, onDelete, isMobile }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ mb: 2, borderRadius: isMobile ? 1 : 2 }}>
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="primary">
            {result.experimentType}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {result.createdAt ? new Date(result.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 1, fontSize: '0.75rem' }}
          >
            {expanded ? 'Hide Parameters' : 'Show Parameters'}
          </Button>
          
          <Collapse in={expanded}>
            <Box sx={{ 
              bgcolor: 'rgba(0, 0, 0, 0.02)', 
              p: 1, 
              borderRadius: 1,
              mb: 1
            }}>
              <pre style={{ 
                margin: 0,
                fontSize: '0.75rem',
                maxHeight: '100px',
                overflow: 'auto'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onView(result)}
          >
            View
          </Button>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(result.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

const ResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleDelete = async (experimentId) => {
    try {
      await deleteExperiment(experimentId);
      await fetchResults();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', m: isMobile ? 2 : 3 }}>
        <CircularProgress size={isMobile ? 30 : 40} />
      </Box>
    );
  }

  return (
    <>
      <Paper 
        sx={{ 
          p: isMobile ? 1.5 : 2, 
          mt: isMobile ? 2 : 3,
          borderRadius: isMobile ? 1 : 2
        }}
      >
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            mb: isMobile ? 1.5 : 2
          }}
        >
          Experiment History
        </Typography>

        {isMobile ? (
          // Mobile view - Card layout
          <Box>
            {results.length === 0 ? (
              <Typography variant="body2" align="center" sx={{ py: 2 }}>
                No experiments saved yet
              </Typography>
            ) : (
              results.map((result) => (
                <MobileResultCard
                  key={result.id}
                  result={result}
                  onView={setSelectedResult}
                  onDelete={(id) => setDeleteConfirm({ open: true, experimentId: id })}
                  isMobile={isMobile}
                />
              ))
            )}
          </Box>
        ) : (
          // Desktop view - Table layout
          <TableContainer>
            <Table size={isTablet ? "small" : "medium"}>
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
                        <pre style={{ 
                          margin: 0,
                          fontSize: isTablet ? '0.75rem' : '0.8rem',
                          maxHeight: '60px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size={isTablet ? "small" : "medium"}
                          variant="outlined"
                          color="primary"
                          onClick={() => setSelectedResult(result)}
                          sx={{ mr: 1 }}
                        >
                          View Details
                        </Button>
                        <IconButton
                          size={isTablet ? "small" : "medium"}
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
        )}
      </Paper>

      <ResultsDetailDialog
        open={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        result={selectedResult}
      />

      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, experimentId: null })}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 'auto',
            m: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
          Delete Experiment
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
            Are you sure you want to delete this experiment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 1.5 }}>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, experimentId: null })}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDelete(deleteConfirm.experimentId)}
            color="error"
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: isMobile ? 'bottom' : 'top',
          horizontal: 'center'
        }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%', fontSize: isMobile ? '0.8rem' : '0.875rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResultsHistory;