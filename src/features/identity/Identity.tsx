import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid2
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIdentityModal from './AddIdentityModal';
import { useGetDidsQuery } from './apiSlice';

export default function IdentityGrid() {
  const [open, setOpen] = useState(false);
  const [identities, setIdentities] = useState([
    { name: 'Catena-X' },
    { name: 'Construct-X' },
    { name: 'Factory-X' },
  ]);

  const participantId = 'participant-context-id';
  const { data: didData, isLoading } = useGetDidsQuery(participantId);

  const allIdentities = [
    ...identities,
    ...(didData?.map((d: any) => ({ name: d.did || 'Unnamed DID' })) ?? []),
  ];

  return (
    <div
      style={{
        backgroundColor: 'transparent',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 0',
      }}
    >
      <Grid2
        className="product-catalog"
        container
        direction="column"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Grid2>
          <Typography
            className="text"
            variant="h3"
            sx={{
              fontWeight: 600,
              color: '#1273e2ff',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            identity
          </Typography>
        </Grid2>
      </Grid2>

      {/* Horizontal, wrapping tile container with gaps */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',               
          justifyContent: 'center',  
          alignItems: 'flex-start',  
          width: '100%',
          maxWidth: 720,           
          padding: '1rem',
        }}
      >
        {allIdentities.map((id, index) => (
          <Card
            key={index}
            sx={{
              width: 128,
              height: 128,
              backgroundColor: '#111',
              border: '1px solid #333',
              color: '#fff',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              '&:hover': {
                backgroundColor: '#1c1c1c',
                borderColor: '#1695b4ff',
                cursor: 'pointer',
              },
            }}
          >
            <CardContent
              sx={{
                padding: '0.5rem !important',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 32, mb: 1, color: '#00bfff' }} />
              <Typography
                variant="body2"
                sx={{ color: '#ffffff', fontWeight: 500 }}
              >
                {id.name}
              </Typography>

            </CardContent>
          </Card>
        ))}

        {/* Add new identity tile */}
        <Card
          onClick={() => setOpen(true)}
          sx={{
            width: 128,
            height: 128,
            backgroundColor: '#111',
            border: '1px dashed #555',
            color: '#00bfff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              backgroundColor: '#1c1c1c',
              borderColor: '#1695b4ff',
              cursor: 'pointer',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </Card>
      </div>

      {/* Modal */}
      {open && (
        <AddIdentityModal
          open={open}
          onClose={() => setOpen(false)}
          participantId={participantId}
          onSave={(newIdentity) => {
            setIdentities((prev) => [...prev, newIdentity]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
