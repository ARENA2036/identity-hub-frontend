import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  participantContextId: string;
};

const CredentialAddDialog: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#0b0b0b',
          boxShadow: '0 0 30px rgba(0, 180, 255, 0.25)',
          color: '#fff',
          borderRadius: '16px',
          p: 2,
          width: '400px',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', color: '#00ff90' }}>
        Add Wallet
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Label *"
            fullWidth
            variant="outlined"
            InputLabelProps={{ style: { color: '#bdbdbd' } }}
            InputProps={{
              style: {
                color: '#fff',
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
              },
            }}
          />
          <TextField
            label="Wallet Address *"
            fullWidth
            variant="outlined"
            InputLabelProps={{ style: { color: '#bdbdbd' } }}
            InputProps={{
              style: {
                color: '#fff',
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
              },
            }}
          />
          <TextField
            label="Holder DID (optional)"
            fullWidth
            variant="outlined"
            InputLabelProps={{ style: { color: '#bdbdbd' } }}
            InputProps={{
              style: {
                color: '#fff',
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
              },
            }}
          />
          <TextField
            label="Issuer (DID or URI) *"
            fullWidth
            variant="outlined"
            InputLabelProps={{ style: { color: '#bdbdbd' } }}
            InputProps={{
              style: {
                color: '#fff',
                backgroundColor: '#1c1c1c',
                borderRadius: 8,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: '#00bfff',
            color: '#00bfff',
            px: 3,
            '&:hover': { bgcolor: '#002a33' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#00ff90',
            color: '#000',
            fontWeight: 600,
            px: 3,
            '&:hover': { bgcolor: '#00cc70' },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CredentialAddDialog;
