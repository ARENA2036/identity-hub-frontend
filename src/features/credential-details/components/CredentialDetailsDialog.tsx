import React from 'react';
import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LockIcon from '@mui/icons-material/Lock';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
// @ts-ignore
import logo from '../../../assets/styles/tx.png';

import {
  useVerifyCredentialMutation,
  useRevokeCredentialMutation,
  useRotateKeyMutation,
} from '../apiSlice';

type Props = {
  open: boolean;
  onClose: () => void;
  credential?: any;
};

const CredentialDetailsDialog: React.FC<Props> = ({ open, onClose, credential }) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    color: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    color: 'info',
  });

  const [verifyCredential, { isLoading: verifying }] = useVerifyCredentialMutation();
  const [revokeCredential, { isLoading: revoking }] = useRevokeCredentialMutation();
  const [rotateKey, { isLoading: rotating }] = useRotateKeyMutation();

  const cred = credential?.verifiableCredentialContainer?.credential;
  const cs = Array.isArray(cred?.credentialSubject) ? cred.credentialSubject[0] : {};

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const toast = (message: string, color: 'success' | 'error' | 'info') =>
    setSnackbar({ open: true, message, color });

  const participantId = credential?.participantContextId || 'demo-participant';
  const credentialId = credential?.id;

  const handleVerify = async () => {
    try {
      await verifyCredential({ participantId, credentialId }).unwrap();
      toast('Credential verified successfully', 'success');
    } catch (e) {
      toast('Verification failed', 'error');
      console.error(e);
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeCredential({ participantId, credentialId }).unwrap();
      toast('Credential revoked successfully', 'success');
    } catch (e) {
      toast('Revoke failed', 'error');
      console.error(e);
    }
  };

  const handleRotateKey = async () => {
    try {
      await rotateKey({ participantContextId: participantId, credentialId }).unwrap();
      toast('Key rotated successfully', 'info');
    } catch (e) {
      toast('Key rotation failed', 'error');
      console.error(e);
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
            color: '#fff',
            width: 'min(1100px, 82vw)',
            height: 'min(640px, 70vh)',
            maxWidth: 'none',
            borderRadius: '16px',
            boxShadow: '0 0 30px rgba(0, 180, 255, 0.25)',
            border: '1px solid rgba(0, 180, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0)',
              backdropFilter: 'blur(10px)',
            },
          },
        }}
      >
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <IconButton onClick={onClose} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>

            <Typography
              variant="body2"
              sx={{
                bgcolor: '#00ff90',
                color: '#000',
                px: 2,
                py: 0.5,
                borderRadius: '8px',
                fontWeight: 700,
              }}
            >
              Active
            </Typography>

            <IconButton onClick={handleMenuOpen} sx={{ color: '#fff' }}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: '#1c1c1c',
                  color: '#fff',
                  '& .MuiMenuItem-root': {
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#333',
                      color: '#00e5ff',
                    },
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleVerify();
                }}
              >
                Verify
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleRevoke();
                }}
              >
                Revoke
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  handleRotateKey();
                }}
              >
                Rotate Key
              </MenuItem>
            </Menu>
          </Stack>

          {/* Main Body */}
          <Stack direction="row" justifyContent="space-between" spacing={4} sx={{ flexGrow: 1 }}>
            {/* Left Section */}
            <Stack spacing={2} flex={1} justifyContent="center" sx={{ pl: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                {(cs?.label as string) || 'Name (Subject)'}
              </Typography>

              <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                {cred?.type?.[1] ?? 'WalletCredential'}
              </Typography>

              <Typography variant="body1" sx={{ color: '#dfe6e9' }}>
                Issuer: <b style={{ color: '#1695b4ff' }}>{cred?.issuer ?? 'did:web:domain.com'}</b>
              </Typography>
              <Typography variant="body1" sx={{ color: '#dfe6e9' }}>
                Holder: <b style={{ color: '#00bfff' }}>{(cs?.id as string) ?? 'did:web:webpage.com'}</b>
              </Typography>

              <Box
                sx={{
                  border: '1px solid #222',
                  borderRadius: '8px',
                  p: 2,
                  mt: 1,
                  bgcolor: '#111',
                  width: '90%',
                }}
              >
                <Typography variant="body2" sx={{ color: '#bdbdbd', mb: 1 }}>
                  Proof
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LockIcon sx={{ color: '#00ff90' }} />
                  <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                    Mock-Proof-Value
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Right Section */}
            <Stack
              spacing={3}
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 300,
                borderLeft: '1px solid #1c1c1c',
                pl: 3,
                pr: 2,
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Catena-X Logo"
                sx={{
                  width: 90,
                  height: 90,
                  objectFit: 'contain',
                  position: 'absolute',
                  top: '50px',
                  right: '60px',
                  mt: -10.5,
                  mb: 1,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#9aa0a6',
                  position: 'absolute',
                  top: '120px',
                  right: '70px',
                }}
              >
                Catena-X
              </Typography>

              <Stack spacing={0.5} alignItems="center">
                <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                  Created: {cred?.issuanceDate ?? '—'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                  Expiration: {cred?.expirationDate ?? '—'}
                </Typography>
              </Stack>

              <Stack spacing={1.5} width="100%" mt={2}>
                <Button
                  variant="outlined"
                  endIcon={<VerifiedUserOutlinedIcon />}
                  disabled={verifying}
                  onClick={handleVerify}
                  sx={{
                    borderColor: '#00ff90',
                    color: '#00ff90',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#00331f', borderColor: '#00ff90' },
                  }}
                >
                  {verifying ? 'Verifying...' : 'VERIFY'}
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<RemoveCircleOutlineIcon />}
                  disabled={revoking}
                  onClick={handleRevoke}
                  sx={{
                    borderColor: '#ff4d4d',
                    color: '#ff4d4d',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#330000', borderColor: '#ff4d4d' },
                  }}
                >
                  {revoking ? 'Revoking...' : 'REVOKE'}
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<CachedOutlinedIcon />}
                  disabled={rotating}
                  onClick={handleRotateKey}
                  sx={{
                    borderColor: '#00bfff',
                    color: '#00bfff',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#002a33', borderColor: '#00bfff' },
                  }}
                >
                  {rotating ? 'Rotating...' : 'ROTATE KEY'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
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
            borderColor:
              snackbar.color === 'error'
                ? '#ff4d4d'
                : snackbar.color === 'success'
                  ? '#00ff90'
                  : '#00bfff',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CredentialDetailsDialog;
