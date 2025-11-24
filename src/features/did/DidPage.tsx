import React, { useMemo, useState } from 'react';
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
} from '@mui/material';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PublishIcon from '@mui/icons-material/Publish';
import UndoIcon from '@mui/icons-material/Undo';
import InfoIcon from '@mui/icons-material/Info';
import { useListParticipantsQuery } from '../participant-context/apiSlice';
import {
    useGetAllDidsQuery,
    useGetDidsForParticipantQuery,
    usePublishDidMutation,
    useUnpublishDidMutation,
    useGetDidStateMutation,
    useAddServiceEndpointMutation,
    useReplaceServiceEndpointMutation,
    useRemoveServiceEndpointMutation,
} from './api';

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

export default function DidPage() {
    const { data: participantsResp } = useListParticipantsQuery({ offset: 0, limit: 200 } as any);
    const participants = (participantsResp?.items ?? participantsResp ?? []) as any[];

    const [selectedParticipant, setSelectedParticipant] = useState<string>('ALL');

    const { data: allDids } = useGetAllDidsQuery();
    const { data: participantDids } = useGetDidsForParticipantQuery(
        selectedParticipant === 'ALL' ? (undefined as any) : { participantContextId: selectedParticipant },
        { skip: selectedParticipant === 'ALL' || !selectedParticipant }
    );

    const dids = useMemo(() => {
        const arr = selectedParticipant === 'ALL' ? (allDids ?? []) : (participantDids ?? []);
        return (arr ?? []).map((d: any) => ({ ...d, displayId: tryDecodeBase64Utf8(d.id ?? d.did ?? d.clientId ?? d.participantContextId ?? '') }));
    }, [allDids, participantDids, selectedParticipant]);

    const [publishDid] = usePublishDidMutation();
    const [unpublishDid] = useUnpublishDidMutation();
    const [getDidState] = useGetDidStateMutation();
    const [addService] = useAddServiceEndpointMutation();
    const [replaceService] = useReplaceServiceEndpointMutation();
    const [removeService] = useRemoveServiceEndpointMutation();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'add' | 'replace' | 'remove' | null>(null);
    const [selectedDidObj, setSelectedDidObj] = useState<any>(null);
    const [serviceId, setServiceId] = useState('');
    const [serviceEndpoint, setServiceEndpoint] = useState('');
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({ open: false, msg: '', severity: 'info' });

    const toast = (msg: string, severity: 'success' | 'error' | 'info' = 'info') => setSnack({ open: true, msg, severity });

    const openDialog = (type: 'add' | 'replace' | 'remove', didObj: any) => {
        setDialogType(type);
        setSelectedDidObj(didObj);
        setServiceId('');
        setServiceEndpoint('');
        setDialogOpen(true);
    };

    const handlePublish = async (didObj: any) => {
        const pid = didObj.participantContextId ?? didObj.participantId ?? didObj.clientId ?? didObj.owner ?? '';
        const did = didObj.id ?? didObj.did ?? didObj.clientId ?? '';
        try {
            await publishDid({ participantContextId: pid, did }).unwrap();
            toast('Publish requested', 'success');
        } catch (e) {
            console.error(e);
            toast('Publish failed', 'error');
        }
    };

    const handleUnpublish = async (didObj: any) => {
        const pid = didObj.participantContextId ?? didObj.participantId ?? didObj.clientId ?? '';
        const did = didObj.id ?? didObj.did ?? didObj.clientId ?? '';
        try {
            await unpublishDid({ participantContextId: pid, did }).unwrap();
            toast('Unpublish requested', 'success');
        } catch (e) {
            console.error(e);
            toast('Unpublish failed', 'error');
        }
    };

    const handleState = async (didObj: any) => {
        const pid = didObj.participantContextId ?? didObj.participantId ?? didObj.clientId ?? '';
        const did = didObj.id ?? didObj.did ?? didObj.clientId ?? '';
        try {
            const res = await getDidState({ participantContextId: pid, did }).unwrap();
            toast(`State: ${JSON.stringify(res)}`, 'info');
        } catch (e) {
            console.error(e);
            toast('State request failed', 'error');
        }
    };

    const handleDialogSubmit = async () => {
        if (!selectedDidObj) return;
        const pid = selectedDidObj.participantContextId ?? selectedDidObj.participantId ?? selectedDidObj.clientId ?? '';
        const did = selectedDidObj.id ?? selectedDidObj.did ?? selectedDidObj.clientId ?? '';

        try {
            if (dialogType === 'add') {
                await addService({ participantContextId: pid, did, serviceBody: { id: serviceId, serviceEndpoint, type: 'Service', autoPublish: true } }).unwrap();
                toast('Service added', 'success');
            } else if (dialogType === 'replace') {
                await replaceService({ participantContextId: pid, did, serviceBody: { id: serviceId, serviceEndpoint, type: 'Service', autoPublish: true } }).unwrap();
                toast('Service replaced', 'success');
            } else if (dialogType === 'remove') {
                await removeService({ participantContextId: pid, did, serviceId, autoPublish: true }).unwrap();
                toast('Service removed', 'success');
            }
        } catch (e) {
            console.error(e);
            toast('Operation failed', 'error');
        } finally {
            setDialogOpen(false);
            setDialogType(null);
            setSelectedDidObj(null);
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
            <Stack direction="column" alignItems="center" sx={{ mb: 3, width: '100%' }}>
                <Stack className="product-catalog" sx={{ mb: 2, width: '100%', display: 'flex', alignItems: 'center' }}>
                    <Typography className="text" variant="h3" sx={{ fontWeight: 600, color: '#1273e2ff', position: 'relative', textAlign: 'center' }}>
                        Did
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 260 }}>

                        
                    </FormControl>
                </Stack>
            </Stack>

            <Stack spacing={2}>
                {dids.length === 0 ? (
                    <Typography color="#8b949e">No DID documents found.</Typography>
                ) : (
                    dids.map((d: any) => (
                        <Card
                            key={d.id ?? d.did ?? d.displayId}
                            sx={{
                                bgcolor: '#121212',
                                color: '#fff',                               
                                border: '1px solid rgba(255,255,255,0.03)',
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack>                                       
                                        <Typography sx={{ fontWeight: 700, color: '#eef6fb' }}>
                                            {d.id ?? d.did ?? d.displayId}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: '#cfd8dd' }}>
                                            Verification methods: {(d.verificationMethod ?? []).length}
                                        </Typography>
                                    </Stack>

                                    {/* Actions - lighter blue used for icons and primary buttons */}
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Button
                                            startIcon={<PublishIcon />}
                                            onClick={() => handlePublish(d)}
                                            sx={{
                                                color: '#7fdfff',               
                                                borderColor: 'transparent',
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: 'rgba(127,223,255,0.06)' },
                                            }}
                                        >
                                            Publish
                                        </Button>

                                        <Button
                                            startIcon={<UndoIcon />}
                                            onClick={() => handleUnpublish(d)}
                                            sx={{
                                                color: '#7fdfff',
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: 'rgba(127,223,255,0.06)' },
                                            }}
                                        >
                                            Unpublish
                                        </Button>

                                        <Button
                                            startIcon={<InfoIcon />}
                                            onClick={() => handleState(d)}
                                            sx={{
                                                color: '#9feeff',
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: 'rgba(159,238,255,0.06)' },
                                            }}
                                        >
                                            State
                                        </Button>

                                        <IconButton
                                            onClick={() => openDialog('add', d)}
                                            title="Add endpoint"
                                            sx={{
                                                color: '#7fdfff',
                                                bgcolor: 'transparent',
                                                '&:hover': { bgcolor: 'rgba(127,223,255,0.06)' },
                                            }}
                                        >
                                            <AddLinkIcon />
                                        </IconButton>

                                        <Button
                                            onClick={() => openDialog('replace', d)}
                                            sx={{
                                                color: '#7fdfff',
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: 'rgba(127,223,255,0.06)' },
                                            }}
                                        >
                                            Replace Endpoint
                                        </Button>

                                        <Button
                                            color="error"
                                            onClick={() => openDialog('remove', d)}
                                            sx={{
                                                textTransform: 'none',
                                                borderColor: 'transparent',
                                                '&:hover': { bgcolor: 'rgba(255,77,77,0.06)' },
                                            }}
                                        >
                                            Remove Endpoint
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>

                    ))
                )}
            </Stack>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>{dialogType === 'add' ? 'Add Service Endpoint' : dialogType === 'replace' ? 'Replace Service Endpoint' : 'Remove Service Endpoint'}</DialogTitle>
                <DialogContent>
                    {(dialogType === 'add' || dialogType === 'replace') && (
                        <>
                            <TextField label="Service ID (eg did:web:super-user#service-1)" fullWidth value={serviceId} onChange={(e) => setServiceId(e.target.value)} sx={{ mb: 2, mt: 1 }} />
                            <TextField label="Service Endpoint" fullWidth value={serviceEndpoint} onChange={(e) => setServiceEndpoint(e.target.value)} sx={{ mb: 2 }} />
                        </>
                    )}
                    {dialogType === 'remove' && (
                        <TextField label="Service ID to remove" fullWidth value={serviceId} onChange={(e) => setServiceId(e.target.value)} sx={{ mt: 1 }} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleDialogSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
                <Alert severity={snack.severity} sx={{ bgcolor: '#121212', color: '#fff' }}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
}
