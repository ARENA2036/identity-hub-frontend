
import React, { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import {
    Box,
    Stack,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    Grid,
} from '@mui/material';
import SyncLockIcon from '@mui/icons-material/SyncLock';
import AddIcon from '@mui/icons-material/Add';
import { useListParticipantsQuery } from '../participant-context/apiSlice';
import {
    useListAllCredentialsQuery,
    useListCredentialsForParticipantQuery,
    useCreateCredentialMutation,
    useUpdateCredentialMutation,
    useDeleteCredentialMutation,
    useTriggerCredentialRequestMutation,
    useLazyFindCredentialRequestQuery,
} from './api';

/* Helper - decode base64-like values for display */
function tryDecodeBase64Utf8(value: any) {
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
        return decodeURIComponent(percent);
    } catch {
        return value;
    }
}

export default function CredentialPage() {
    const { data: participantsResp } = useListParticipantsQuery({ offset: 0, limit: 200 } as any);
    const participants = (participantsResp?.items ?? participantsResp ?? []) as any[];

    const [selectedParticipant, setSelectedParticipant] = useState<string>('ALL');

    const { data: allCreds } = useListAllCredentialsQuery(undefined, { skip: false });
    const { data: partCreds } = useListCredentialsForParticipantQuery(
        selectedParticipant === 'ALL' ? (undefined as any) : { participantContextId: selectedParticipant },
        { skip: selectedParticipant === 'ALL' }
    );

    const creds = useMemo(() => (selectedParticipant === 'ALL' ? (allCreds ?? []) : (partCreds ?? [])), [selectedParticipant, allCreds, partCreds]);

    const [createCred] = useCreateCredentialMutation();
    const [updateCred] = useUpdateCredentialMutation();
    const [deleteCred] = useDeleteCredentialMutation();
    const [triggerReq] = useTriggerCredentialRequestMutation();

    const [triggerFindReq, findReqResult] = useLazyFindCredentialRequestQuery();

    const [openModal, setOpenModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
    const [editingJson, setEditingJson] = useState<string>('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        msg: '',
        severity: 'info',
    });
    const toast = (msg: string, severity: 'success' | 'error' | 'info' = 'info') => setSnack({ open: true, msg, severity });

    const openCreate = () => {
        setModalMode('create');
        setEditingJson('{}');
        setEditingId(null);
        setOpenModal(true);
    };
    const openEdit = (cred: any) => {
        setModalMode('update');
        setEditingId(cred.id || cred.credentialId || null);
        setEditingJson(JSON.stringify(cred, null, 2));
        setOpenModal(true);
    };

    const handleSubmit = async () => {
        try {
            const body = JSON.parse(editingJson);
            if (!body) throw new Error('Invalid JSON');
            if (modalMode === 'create') {
                await createCred({ participantContextId: selectedParticipant, body }).unwrap();
                toast('Credential created', 'success');
            } else {
                await updateCred({ participantContextId: selectedParticipant, body }).unwrap();
                toast('Credential updated', 'success');
            }
            setOpenModal(false);
        } catch (err) {
            console.error(err);
            const errMsg = (err as any)?.message ?? 'error';
            toast(`Operation failed: ${errMsg}`, 'error');
        }
    };

    const handleDelete = async (c: any) => {
        const id = c.id ?? c.credentialId ?? c.verifiableCredentialContainer?.credential?.id;
        if (!id) {
            toast('Missing credential id', 'error');
            return;
        }
        try {
            await deleteCred({ participantContextId: selectedParticipant, credentialId: id }).unwrap();
            toast('Deleted', 'success');
        } catch (err) {
            console.error(err);
            toast('Delete failed', 'error');
        }
    };

    const handleTriggerRequest = async () => {
        if (selectedParticipant === 'ALL') {
            toast('Select a participant first', 'info');
            return;
        }

        const body = {
            credentials: [
                {
                    format: 'ldp_vc',
                    id: creds?.[0]?.id ?? 'credential-id',
                    type: 'MembershipCredential',
                },
            ],
            holderPid: 'did:web:super-user',
            issuerDid: 'did:web:super-user',
        };
        try {
            await triggerReq({ participantContextId: selectedParticipant, body }).unwrap();
            toast('Credential request triggered', 'success');
        } catch (err) {
            console.error(err);
            toast('Trigger failed', 'error');
        }
    };

    const doFindRequest = async (holderPid: string) => {
        if (selectedParticipant === 'ALL') {
            toast('Select a participant first', 'info');
            return;
        }
        try {
            const res = await triggerFindReq({ participantContextId: selectedParticipant, holderPid }).unwrap();
            console.log('find request result', res);
            toast('Find request succeeded', 'success');
        } catch (err) {
            console.error(err);
            toast('Find request failed', 'error');
        }
    };

    const participantOptions = useMemo(() => {
        return participants.map((p: any) => {
            const raw = p.participantContextId ?? p.participantId ?? p.clientId ?? p.did ?? '';
            const display = tryDecodeBase64Utf8(raw).replace(/^did:web:/, '');
            const backendVal = p.participantContextId ?? p.participantId ?? p.clientId ?? p.did ?? '';
            return { backendVal, display };
        });
    }, [participants]);

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="column" alignItems="center" sx={{ mb: 3 }}>

                <Stack className="product-catalog" sx={{ mb: 2, width: '100%', display: 'flex', alignItems: 'center' }}>
                    <Typography className="text" variant="h3" sx={{ fontWeight: 600, color: '#1273e2ff', position: 'relative', textAlign: 'center' }}>
                        Verifiable Credentials
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 260 }}>

                        <Select value={selectedParticipant} onChange={(e) => setSelectedParticipant(String(e.target.value))} sx={{ bgcolor: '#0f0f0f', color: '#fff' }}>
                            <MenuItem value="ALL">All participants</MenuItem>
                            {participantOptions.map((p) => (
                                <MenuItem key={p.backendVal} value={p.backendVal}>
                                    {p.display || p.backendVal}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate} sx={{ bgcolor: '#1695b4ff' }}>
                        Add
                    </Button>

                    <Button startIcon={<SyncLockIcon />} variant="outlined" onClick={handleTriggerRequest}>
                        Trigger Request
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={2}>
                {(creds ?? []).map((c: any) => {
                    const credId = c.id ?? c.credentialId ?? c.verifiableCredentialContainer?.credential?.id ?? 'unknown';
                    const issuer = c.verifiableCredentialContainer?.credential?.issuer ?? '—';
                    const subject = (c.verifiableCredentialContainer?.credential?.credentialSubject ?? [])[0]?.id ?? '—';
                    const title = c.verifiableCredentialContainer?.credential?.type?.[1] ?? 'Credential';

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={credId}>
                            <Card sx={{ bgcolor: '#121212', color: '#fff' }}>
                                <CardContent>
                                    <Stack spacing={1}>
                                        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                                        <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                                            {credId}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                                            Issuer: {issuer}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                                            Subject: {subject}
                                        </Typography>

                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Button size="small" onClick={() => openEdit(c)} variant="outlined">
                                                Edit
                                            </Button>
                                            <Button size="small" color="error" onClick={() => handleDelete(c)}>
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Create / Update Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="lg">
                <DialogTitle>{modalMode === 'create' ? 'Create Credential' : 'Update Credential'}</DialogTitle>
                <DialogContent>
                    <TextField multiline rows={16} fullWidth value={editingJson} onChange={(e) => setEditingJson(e.target.value)} sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {modalMode === 'create' ? 'Create' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack({ ...snack, open: false })}>
                <Alert severity={snack.severity} sx={{ bgcolor: '#121212', color: '#fff' }}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
