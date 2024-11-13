// src/components/dashboard/ResultsHistory.jsx
// ... imports tetap sama ...

const ResultsHistory = () => {
  // ... state dan useEffect tetap sama ...

  const handleViewDetails = (result) => {
    console.log("View Details clicked:", result);
    setSelectedResult(result);
    setDetailOpen(true);
  };

  // ... kode lain tetap sama sampai bagian Dialog ...

  return (
    <>
      {/* Paper dan Table tetap sama */}

      <Dialog
        open={detailOpen}
        onClose={() => {
          console.log('Closing dialog');
          setDetailOpen(false);
          setSelectedResult(null); // Tambahkan ini
        }}
        maxWidth="md"
        fullWidth
        sx={{ 
          '& .MuiDialog-paper': { 
            minWidth: '300px',
            maxHeight: '80vh'
          },
          zIndex: 1300 // Tambahkan ini
        }}
      >
        <DialogTitle>
          Experiment Details
        </DialogTitle>
        <DialogContent>
          {selectedResult ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedResult.experimentType}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedResult.createdAt ? 
                  new Date(selectedResult.createdAt.seconds * 1000).toLocaleString() 
                  : 'N/A'
                }
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Parameters:
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2,
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxWidth: '100%'
                }}
              >
                {JSON.stringify(selectedResult.data, null, 2)}
              </Box>
            </Box>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {selectedResult && (
            <Button 
              onClick={() => handleExport(selectedResult)}
              variant="outlined"
              color="primary"
            >
              Export PDF
            </Button>
          )}
          <Button 
            onClick={() => {
              setDetailOpen(false);
              setSelectedResult(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar tetap sama */}
    </>
  );
};

export default ResultsHistory;