import React, { useState, useEffect } from 'react';
import { Card, Typography, CircularProgress, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[2],
}));

const DataContainer = styled('div')({ 
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '8px',
});

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const SimDataDisplay = () => {
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSimData = async () => {
    try {
      const response = await fetch('/api/sim-data');
      if (!response.ok) {
        throw new Error('Failed to fetch SIM data');
      }
      const data = await response.json();
      setSimData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchSimData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <StyledCard>
        <Typography variant="h6">SIM Data</Typography>
        <DataContainer>
          <CircularProgress size={24} />
        </DataContainer>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard>
        <Typography variant="h6">SIM Data</Typography>
        <Typography color="error">{error}</Typography>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <Typography variant="h6" gutterBottom>SIM Data</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <IconContainer>
            <StorageIcon color="primary" />
            <Typography variant="body1">
              Balance Info:
            </Typography>
            <Typography variant="h6" color="primary">
              {simData ? simData.balance : 'N/A'}
            </Typography>
          </IconContainer>
        </Grid>
        <Grid item xs={12}>
          <IconContainer>
            <StorageIcon color="primary" />
            <Typography variant="body1">
              Total Usage:
            </Typography>
            <Typography variant="h6" color="primary">
              {simData && simData.data_usage != null ? `${(simData.data_usage / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
            </Typography>
          </IconContainer>
        </Grid>
        <Grid item xs={12}>
          <IconContainer>
            <AccessTimeIcon color="primary" />
            <Typography variant="caption" color="textSecondary">
              Last updated: {simData && simData.timestamp ? new Date(simData.timestamp).toLocaleString() : 'N/A'}
            </Typography>
          </IconContainer>
        </Grid>
      </Grid>
    </StyledCard>
  );
};

export default SimDataDisplay; 
