import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';

// Componentes
import StatusMonitor from '../components/StatusMonitor';
import PostEditor from '../components/PostEditor';
import GroupSelector from '../components/GroupSelector';
import ScheduleManager from '../components/ScheduleManager';

function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Status do Sistema */}
        <Grid item xs={12}>
          <StatusMonitor />
        </Grid>

        {/* Editor de Posts */}
        <Grid item xs={12} md={8}>
          <PostEditor />
        </Grid>

        {/* Seletor de Grupos */}
        <Grid item xs={12} md={4}>
          <GroupSelector />
        </Grid>

        {/* Agendamentos */}
        <Grid item xs={12}>
          <ScheduleManager />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 