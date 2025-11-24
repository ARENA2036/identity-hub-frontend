import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useListParticipantsQuery } from '../participant-context/apiSlice'; // adjust path if needed
import {
  useListAllKeypairsQuery,
  useListKeypairsForParticipantQuery,
  useRevokeKeypairMutation,
  useRotateKeypairMutation,
  useActivateKeypairMutation,
} from './api';

function tryDecodeBase64Utf8(value: any): string {
  if (!value || typeof value !== 'string') return value;
  try {
    const maybe = value.startsWith('did:web:') ? value.replace(/^did:web:/, '') : value;
    const safe = maybe.replace(/-/g, '+').replace(/_/g, '/');
    const pad = safe.length % 4;
    const padded = pad ? safe + '='.repeat(4 - pad) : safe;
    const binary = atob(padded);
    let percent = '';
    for (let i = 0; i < binary.length; i++) {
      percent += '%' + ('0' + binary.charCodeAt(i).toString(16)).slice(-2);
    }
    const decoded = decodeURIComponent(percent);
    if (/[\x00-\x08\x0E-\x1F]/.test(decoded)) return value;
    return decoded;
  } catch {
    return value;
  }
}

function encodeToBase64(input: string): string {
  if (!input || typeof input !== 'string') return input;
  try {
    const utf8 = encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_m, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(utf8);
  } catch {
    try {
      return btoa(input);
    } catch {
      return input;
    }
  }
}

function looksLikeBase64(s: string | undefined): boolean {
  if (!s || typeof s !== 'string') return false;
 
  return /^[A-Za-z0-9+/=_-]+$/.test(s) && s.length >= 4 && s.length % 4 === 0;
}


export default function KeypairPage() {
  const { data: participantsResp } = useListParticipantsQuery({ offset: 0, limit: 200 } as any);
  const participants = (participantsResp?.items ?? participantsResp ?? []) as any[];

  const [selectedParticipant, setSelectedParticipant] = useState<string>('ALL');


  const {
    data: allKeypairs,
    isLoading: allLoading,
    isFetching: allFetching,
  } = useListAllKeypairsQuery(selectedParticipant === 'ALL' ? { offset: 0, limit: 200 } : undefined, {
    skip: selectedParticipant !== 'ALL',
  });

  const {
    data: participantKeypairs,
    isLoading: partLoading,
    isFetching: partFetching,
  } = useListKeypairsForParticipantQuery(
    { participantContextId: selectedParticipant },
    { skip: selectedParticipant === 'ALL' || !selectedParticipant }
  );

  const rawKeypairs = useMemo(() => (selectedParticipant === 'ALL' ? (allKeypairs ?? []) : (participantKeypairs ?? [])), [
    selectedParticipant,
    allKeypairs,
    participantKeypairs,
  ]);

  const mappedKeypairs = useMemo(() => {
    const arr = (rawKeypairs ?? []).map((kp: any) => {
      const rawPid = kp.participantContextId ?? kp.participantId ?? kp.clientId ?? kp.did ?? '';
      return {
        ...kp,
        displayParticipantContextId: tryDecodeBase64Utf8(rawPid),
      };
    });
    arr.sort((a: any, b: any) => {
      const A = String(a.displayParticipantContextId ?? '').toLowerCase();
      const B = String(b.displayParticipantContextId ?? '').toLowerCase();
      return A.localeCompare(B);
    });
    return arr;
  }, [rawKeypairs]);

  const [revokeKeypair] = useRevokeKeypairMutation();
  const [rotateKeypair] = useRotateKeypairMutation();
  const [activateKeypair] = useActivateKeypairMutation();

  const [openRevoke, setOpenRevoke] = useState(false);
  const [openRotate, setOpenRotate] = useState(false);
  const [dialogRow, setDialogRow] = useState<any>(null);
  const [rotDuration, setRotDuration] = useState<number>(999);
  const [rotBody, setRotBody] = useState<string>('');
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    msg: '',
    severity: 'info',
  });
  const toast = (msg: string, severity: 'success' | 'error' | 'info' = 'info') => setSnack({ open: true, msg, severity });

  const loading = allLoading || partLoading || allFetching || partFetching;

  const handleOpenRevoke = (row: any) => {
    setDialogRow(row);
    setOpenRevoke(true);
    setRotBody(
      JSON.stringify(
        {
          active: true,
          keyId: row.keyId || `key-${Date.now()}`,
          privateKeyAlias: `${row.privateKeyAlias || 'alias'}-rot`,
          type: row.keyContext === 'JsonWebKey2020' ? 'JsonWebKey2020' : 'Ed25519VerificationKey2020',
          keyGeneratorParams: { algorithm: 'EdDSA', curve: 'Ed25519' },
          resourceId: `resource-${Date.now()}`,
        },
        null,
        2
      )
    );
  };
  const handleOpenRotate = (row: any) => {
    setDialogRow(row);
    setOpenRotate(true);
    setRotBody(
      JSON.stringify(
        {
          active: true,
          keyId: row.keyId || `key-${Date.now()}`,
          privateKeyAlias: `${row.privateKeyAlias || 'alias'}-rot`,
          type: row.keyContext === 'JsonWebKey2020' ? 'JsonWebKey2020' : 'Ed25519VerificationKey2020',
          keyGeneratorParams: { algorithm: 'EdDSA', curve: 'Ed25519' },
          resourceId: `resource-${Date.now()}`,
        },
        null,
        2
      )
    );
  };

  const getBackendParticipantId = (p: any) => {
    const encoded = p?.participantContextId ?? p?.participant_id ?? p?.clientId ?? undefined;
    if (encoded && looksLikeBase64(encoded)) return encoded;
    const plain = p?.participantId ?? p?.participant_id ?? p?.id ?? p?.clientId ?? p?.did ?? '';
    const cleaned = typeof plain === 'string' ? String(plain).replace(/^did:web:/, '') : '';
    return encodeToBase64(cleaned || '');
  };

  const encodeKeypairIdForBackend = (kpId: string) => {
    if (!kpId) return kpId;
    if (looksLikeBase64(kpId)) return kpId;
    return encodeToBase64(kpId);
  };

  const handleRevokeConfirm = async () => {
    if (!dialogRow) return;
    const rawPid = dialogRow.participantContextId ?? dialogRow.participantId ?? dialogRow.clientId ?? dialogRow.did ?? '';
    const backendPid = looksLikeBase64(rawPid) ? rawPid : encodeToBase64(String(rawPid));
    const rawKeypairId = dialogRow.id;
    const backendKeypairId = encodeKeypairIdForBackend(rawKeypairId);

    if (!backendPid || !backendKeypairId) {
      toast('Missing participant or keypair id', 'error');
      setOpenRevoke(false);
      return;
    }

    try {
      await revokeKeypair({ participantContextId: backendPid, keypairId: backendKeypairId, body: JSON.parse(rotBody) }).unwrap();
      toast('Keypair revoked and successor created', 'success');
    } catch (err) {
      console.error(err);
      toast('Revoke failed', 'error');
    } finally {
      setOpenRevoke(false);
      setDialogRow(null);
    }
  };

  const handleRotateConfirm = async () => {
    if (!dialogRow) return;
    const rawPid = dialogRow.participantContextId ?? dialogRow.participantId ?? dialogRow.clientId ?? dialogRow.did ?? '';
    const backendPid = looksLikeBase64(rawPid) ? rawPid : encodeToBase64(String(rawPid));
    const rawKeypairId = dialogRow.id;
    const backendKeypairId = encodeKeypairIdForBackend(rawKeypairId);

    if (!backendPid || !backendKeypairId) {
      toast('Missing participant or keypair id', 'error');
      setOpenRotate(false);
      return;
    }

    try {
      await rotateKeypair({ participantContextId: backendPid, keypairId: backendKeypairId, duration: rotDuration, body: JSON.parse(rotBody) }).unwrap();
      toast('Keypair rotated', 'success');
    } catch (err) {
      console.error(err);
      toast('Rotate failed', 'error');
    } finally {
      setOpenRotate(false);
      setDialogRow(null);
    }
  };

  const handleActivate = async (row: any) => {
    const rawPid = row.participantContextId ?? row.participantId ?? row.clientId ?? row.did ?? '';
    const backendPid = looksLikeBase64(rawPid) ? rawPid : encodeToBase64(String(rawPid));
    const backendKeypairId = encodeKeypairIdForBackend(row.id);

    if (!backendPid || !backendKeypairId) {
      toast('Missing participant or keypair id', 'error');
      return;
    }

    try {
      await activateKeypair({ participantContextId: backendPid, keypairId: backendKeypairId }).unwrap();
      toast('Keypair activated', 'success');
    } catch (err) {
      console.error(err);
      toast('Activate failed', 'error');
    }
  };

  const participantOptions = useMemo(() => {
    return participants
      .map((p: any) => {
        
        const encoded = p.participantContextId ?? p.participant_id ?? p.clientId ?? undefined;
        let backendId = '';
        if (encoded && looksLikeBase64(encoded)) {
          backendId = encoded;
        } else {
          const plain = p.participantId ?? p.participant_id ?? p.id ?? p.clientId ?? p.did ?? '';
          const cleaned = typeof plain === 'string' ? String(plain).replace(/^did:web:/, '') : '';
          backendId = cleaned ? encodeToBase64(cleaned) : '';
        }
        const displayRaw = encoded ?? (p.participantId ?? p.participant_id ?? p.id ?? p.clientId ?? p.did ?? '');
        const display = tryDecodeBase64Utf8(displayRaw).replace(/^did:web:/, '');
        return backendId ? { backendId, display } : null;
      })
      .filter(Boolean) as { backendId: string; display: string }[];
  }, [participants]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="column" alignItems="center" sx={{ mb: 3, width: '100%' }}>
        <Stack className="product-catalog" sx={{ mb: 2, width: '100%', display: 'flex', alignItems: 'center' }}>
          <Typography className="text" variant="h3" sx={{ fontWeight: 600, color: '#1273e2ff', position: 'relative', textAlign: 'center' }}>
            KEY PAIRS
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel sx={{ color: '#bdbdbd' }}>Participant</InputLabel>
            <Select
              label="Participant"
              value={selectedParticipant}
              onChange={(e) => {
                const val = String(e.target.value ?? 'ALL');
                setSelectedParticipant(val || 'ALL');
              }}
              sx={{ bgcolor: '#0f0f0f', color: '#fff' }}
            >
              <MenuItem value="ALL">All participants</MenuItem>
              {participantOptions.map((opt) => (
                <MenuItem key={opt.backendId} value={opt.backendId}>
                  {opt.display || opt.backendId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={2}>
          {mappedKeypairs.map((kp: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={kp.id}>
              <Card sx={{ bgcolor: '#121212', color: '#fff', borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <VpnKeyIcon sx={{ color: '#00bfff' }} />
                        <Typography sx={{ fontWeight: 700 }}>{kp.keyId}</Typography>
                      </Stack>

                      <Stack spacing={1} direction="row">
                        <Tooltip title="Rotate" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRotate(kp)}
                            sx={{
                              color: '#00bfff',
                              '&:hover': { bgcolor: 'rgba(192, 62, 22, 0.08)' },
                            }}
                            aria-label={`rotate-${kp.id}`}
                          >
                            <RotateLeftIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Revoke" placement="top" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRevoke(kp)}
                            sx={{
                              color: '#ff6b6b',
                              '&:hover': { bgcolor: 'rgba(255,107,107,0.08)' },
                            }}
                            aria-label={`revoke-${kp.id}`}
                          >
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                      {kp.displayParticipantContextId ?? kp.participantContextId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>State: {kp.state}</Typography>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>Use duration: {kp.useDuration}</Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined"  onClick={() => handleActivate(kp)} startIcon={<AutorenewIcon />}>
                        Activate
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Revoke dialog */}
      <Dialog open={openRevoke} onClose={() => setOpenRevoke(false)} fullWidth maxWidth="md">
        <DialogTitle>Revoke Keypair and create successor</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#bdbdbd', mb: 1 }}>{dialogRow?.keyId}</Typography>
          <TextField value={rotBody} onChange={(e) => setRotBody(e.target.value)} multiline rows={8} fullWidth variant="outlined" sx={{ bgcolor: '#0e0e10' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRevoke(false)}>Cancel</Button>
          <Button color="error" onClick={handleRevokeConfirm}>Revoke</Button>
        </DialogActions>
      </Dialog>

      {/* Rotate dialog */}
      <Dialog open={openRotate} onClose={() => setOpenRotate(false)} fullWidth maxWidth="md">
        <DialogTitle>Rotate Keypair</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#bdbdbd', mb: 1 }}>{dialogRow?.keyId}</Typography>

          <Stack spacing={2}>
            <TextField label="Rotation duration (ms)" value={String(rotDuration)} onChange={(e) => setRotDuration(Number(e.target.value))} />
            <TextField value={rotBody} onChange={(e) => setRotBody(e.target.value)} multiline rows={8} fullWidth variant="outlined" sx={{ bgcolor: '#0e0e10' }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRotate(false)}>Cancel</Button>
          <Button color="primary" onClick={handleRotateConfirm}>Rotate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ bgcolor: '#121212', color: '#fff' }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
