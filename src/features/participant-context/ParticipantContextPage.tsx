import React from 'react';
import { Box } from '@mui/material';
import ParticipantListPage from './components/ParticipantListPage';

export default function ParticipantContextPage() {
  return (
    <Box sx={{ p: 3, minHeight: '80vh' }}>
      <ParticipantListPage />
    </Box>
  );
}
