import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

import { useCreateCredentialMutation } from '../apiSlice';

type Props = {
  open: boolean;
  onClose: () => void;
  participantContextId: string;
};

const CredentialAddDialog: React.FC<Props> = ({ open, onClose, participantContextId }) => {
  const [label, setLabel] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [holderDid, setHolderDid] = useState('');
  const [issuer, setIssuer] = useState('');

  const [createCredential, { isLoading }] = useCreateCredentialMutation();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', color: 'success' as 'success' | 'error' });

  const handleSave = async () => {
    if (!label || !walletAddress || !issuer) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', color: 'error' });
      return;
    }

    const body = {
      participantContextId,
      verifiableCredentialContainer: {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'WalletCredential'],
          issuer,
          issuanceDate: new Date().toISOString(),
          credentialSubject: [
            {
              id: holderDid || 'did:web:default',
              label,
              walletAddress,
            },
          ],
        },
      },
    };

    try {
      await createCredential({ participantId: participantContextId, body }).unwrap();
      setSnackbar({ open: true, message: 'Credential added successfully.', color: 'success' });
      // reset form
      setLabel('');
      setWalletAddress('');
      setHolderDid('');
      setIssuer('');
      setTimeout(() => onClose(), 1200); // small delay to show success
    } catch (err) {
      console.error('Credential creation failed:', err);
      setSnackbar({ open: true, message: 'Failed to add credential.', color: 'error' });
    }
  };

  return (
    <>
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
              backgroundColor: 'transparent',
              backdropFilter: 'blur(4px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', color: '#1695b4ff' }}>
          Add Credential
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label *"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
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
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
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
              value={holderDid}
              onChange={(e) => setHolderDid(e.target.value)}
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
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
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
              '&:hover': { bgcolor: '#1273e2ff' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isLoading}
            onClick={handleSave}
            sx={{
              bgcolor: '#1695b4ff',
              color: '#000',
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: '#1273e2ff' },
            }}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.color}
          sx={{
            bgcolor: '#121212',
            color: '#fff',
            border: '1px solid',
            borderColor: snackbar.color === 'error' ? '#ff4d4d' : '#00ff90',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CredentialAddDialog;
