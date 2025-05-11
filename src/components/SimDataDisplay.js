import React, { useState, useEffect } from 'react';
import { Card, Typography, CircularProgress, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import StorageIcon from '@mui/icons-material/Storage';

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

function formatMB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const SimDataDisplay = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsage = async () => {
    try {
      // Use the edge device API endpoint
      const backendUrl = process.env.REACT_APP_EDGE_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/data-usage`);
      if (!response.ok) {
        throw new Error('Failed to fetch data usage');
      }
      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 300000);
    return () => clearInterval(interval);
  }, []);

  // Prepare graph data (1d points)
  let graphPoints = [];
  if (usage && usage['1d'] && usage['1d'].points) {
    graphPoints = usage['1d'].points.map((p, i) => ({
      x: i,
      y: p.bytes_sent + p.bytes_received
    }));
  }
  const maxY = graphPoints.length > 0 ? Math.max(...graphPoints.map(p => p.y)) : 1;

  if (loading) {
    return (
      <StyledCard>
        <Typography variant="h6">Data Usage</Typography>
        <DataContainer>
          <CircularProgress size={24} />
        </DataContainer>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard>
        <Typography variant="h6">Data Usage</Typography>
        <Typography color="error">{error}</Typography>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <Typography variant="h6" gutterBottom>Data Usage</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <IconContainer>
            <StorageIcon color="primary" />
            <Typography variant="body1">Last 24h:</Typography>
            <Typography variant="h6" color="primary">
              {usage && usage['1d'] ? formatMB(usage['1d'].bytes_sent + usage['1d'].bytes_received) : 'N/A'}
            </Typography>
          </IconContainer>
        </Grid>
        <Grid item xs={12}>
          <IconContainer>
            <StorageIcon color="primary" />
            <Typography variant="body1">Last 7d:</Typography>
            <Typography variant="h6" color="primary">
              {usage && usage['1w'] ? formatMB(usage['1w'].bytes_sent + usage['1w'].bytes_received) : 'N/A'}
            </Typography>
          </IconContainer>
        </Grid>
        <Grid item xs={12}>
          <IconContainer>
            <StorageIcon color="primary" />
            <Typography variant="body1">Last 30d:</Typography>
            <Typography variant="h6" color="primary">
              {usage && usage['1m'] ? formatMB(usage['1m'].bytes_sent + usage['1m'].bytes_received) : 'N/A'}
            </Typography>
          </IconContainer>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">Last 24h Usage Graph</Typography>
          <svg width="100%" height="40" viewBox={`0 0 100 40`} style={{ background: '#f5f5f5', borderRadius: 4 }}>
            {graphPoints.length > 1 && (
              <polyline
                fill="none"
                stroke="#1976d2"
                strokeWidth="2"
                points={graphPoints.map((p, i) => `${(i / (graphPoints.length - 1)) * 100},${40 - (p.y / maxY) * 35}`).join(' ')}
              />
            )}
          </svg>
        </Grid>
      </Grid>
    </StyledCard>
  );
};

export default SimDataDisplay; 
