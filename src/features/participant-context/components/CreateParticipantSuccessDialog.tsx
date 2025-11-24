import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type Props = {
  open: boolean;
  onClose: () => void;
  response: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  } | null;
};

export default function CreateParticipantSuccessDialog({ open, onClose, response }: Props) {
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  const copy = async (value?: string, label = 'Value') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setSnack({ open: true, msg: `${label} copied to clipboard`, severity: 'success' });
    } catch (e) {
      setSnack({ open: true, msg: `Copy failed`, severity: 'error' });
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
            borderRadius: 2,
            p: 2,
            width: 560,
            boxShadow: '0 6px 30px rgba(0,140,255,0.16)',
            border: '1px solid rgba(0,140,255,0.12)',
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(4, 18, 30, 0.6)', // bluish dark tint
              backdropFilter: 'blur(6px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#00bfff', fontWeight: 700 }}>
          Participant Context Created
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: '#cfd8dc', mb: 2 }}>
            The participant context was created successfully. Copy the credentials below and keep them safe.
          </Typography>

          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" sx={{ color: '#9aa0a6' }}>
                API Key
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <TextField
                  value={response?.apiKey ?? ''}
                  fullWidth
                  size="small"
                  inputProps={{ readOnly: true, style: { fontFamily: 'monospace' } }}
                  sx={{ input: { color: '#e6eef6', bgcolor: '#0f0f0f' } }}
                />
                <IconButton
                  size="small"
                  onClick={() => copy(response?.apiKey, 'API Key')}
                  sx={{ color: '#00bfff' }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#9aa0a6' }}>
                Client ID
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <TextField
                  value={response?.clientId ?? ''}
                  fullWidth
                  size="small"
                  inputProps={{ readOnly: true, style: { fontFamily: 'monospace' } }}
                  sx={{ input: { color: '#e6eef6', bgcolor: '#0f0f0f' } }}
                />
                <IconButton
                  size="small"
                  onClick={() => copy(response?.clientId, 'Client ID')}
                  sx={{ color: '#00bfff' }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#9aa0a6' }}>
                Client Secret
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <TextField
                  value={response?.clientSecret ?? ''}
                  fullWidth
                  size="small"
                  inputProps={{ readOnly: true, style: { fontFamily: 'monospace' } }}
                  sx={{ input: { color: '#e6eef6', bgcolor: '#0f0f0f' } }}
                />
                <IconButton
                  size="small"
                  onClick={() => copy(response?.clientSecret, 'Client Secret')}
                  sx={{ color: '#00bfff' }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ color: '#00bfff', borderColor: '#00bfff' }}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (response?.apiKey) navigator.clipboard.writeText(response.apiKey);
            }}
            sx={{ bgcolor: '#00bfff', color: '#000', fontWeight: 700 }}
          >
            Copy API Key
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={1800}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={snack.severity}
          sx={{
            bgcolor: '#121212',
            color: '#fff',
            border: '1px solid',
            borderColor: snack.severity === 'error' ? '#ff4d4d' : '#00ff90',
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
