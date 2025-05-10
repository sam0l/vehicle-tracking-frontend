import React from 'react';
import SimDataDisplay from './SimDataDisplay';
import { Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[2],
}));

const Dashboard = ({ telemetry }) => {
  const latest = telemetry[telemetry.length - 1];
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <StyledPaper>
          <Typography variant="h6" gutterBottom>Current Data</Typography>
          {latest && (
            <div>
              <Typography variant="body1">
                Speed: {latest.speed} km/h
              </Typography>
              <Typography variant="body1">
                Coordinates: ({latest.latitude}, {latest.longitude})
              </Typography>
            </div>
          )}
        </StyledPaper>
      </Grid>
      <Grid item xs={12} md={6}>
        <SimDataDisplay />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
