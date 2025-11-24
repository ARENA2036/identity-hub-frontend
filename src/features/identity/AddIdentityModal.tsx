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
import { useCreateDidMutation } from './apiSlice';

type Props = {
    open: boolean;
    onClose: () => void;
    participantId: string;
    onSave: (newIdentity: { name: string }) => void;
};

const AddIdentityModal: React.FC<Props> = ({ open, onClose, participantId, onSave }) => {
    const [did, setDid] = useState('');
    const [keyId, setKeyId] = useState('');
    const [privateKeyAlias, setPrivateKeyAlias] = useState('');
    const [algorithm, setAlgorithm] = useState('EdDSA');
    const [curve, setCurve] = useState('Ed25519');

    const [createDid, { isLoading }] = useCreateDidMutation();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        color: 'success' as 'success' | 'error',
    });

    const handleSave = async () => {
        if (!did || !keyId || !privateKeyAlias) {
            setSnackbar({ open: true, message: 'Please fill all required fields.', color: 'error' });
            return;
        }

        const body = {
            did,
            key: {
                keyGeneratorParams: { algorithm, curve },
                keyId,
                privateKeyAlias,
            },
        };

        try {
            await createDid({ participantId, body }).unwrap();
            setSnackbar({ open: true, message: 'Identity added successfully.', color: 'success' });
            onSave({ name: did });
            setDid('');
            setKeyId('');
            setPrivateKeyAlias('');
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            console.error('Identity creation failed:', err);
            setSnackbar({ open: true, message: 'Failed to add identity.', color: 'error' });
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
                <DialogTitle
                    sx={{ fontWeight: 700, textAlign: 'center', color: '#1695b4ff' }}
                >
                    Add Identity
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="DID *"
                            value={did}
                            onChange={(e) => setDid(e.target.value)}
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
                            label="Key ID *"
                            value={keyId}
                            onChange={(e) => setKeyId(e.target.value)}
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
                            label="Private Key Alias *"
                            value={privateKeyAlias}
                            onChange={(e) => setPrivateKeyAlias(e.target.value)}
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
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Algorithm"
                                value={algorithm}
                                onChange={(e) => setAlgorithm(e.target.value)}
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
                                label="Curve"
                                value={curve}
                                onChange={(e) => setCurve(e.target.value)}
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

export default AddIdentityModal;
