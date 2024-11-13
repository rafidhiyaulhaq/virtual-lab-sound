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
  Button
} from '@mui/material';
import { getUserResults } from '../../firebase/results';
import { useAuth } from '../../context/AuthContext';

const ResultsHistory = () => {
  const [results, setResults] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      if (user) {
        const userResults = await getUserResults(user.uid);
        setResults(userResults);
      }
    };
    fetchResults();
  }, [user]);

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Experiment History
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Experiment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  {new Date(result.createdAt?.seconds * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>{result.experimentType}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ResultsHistory;