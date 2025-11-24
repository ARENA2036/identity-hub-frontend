import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Stack,
  CircularProgress,
  CardActions,
  Menu,
  MenuItem,
  Grid2,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  useListParticipantsQuery,
  useDeleteParticipantMutation,
  useRegenerateTokenMutation,
} from '../apiSlice';
import CreateParticipantModal from './CreateParticipantModal';

export default function ParticipantListPage() {

  const deleteConfirmRef = useRef<{ pid?: string }>({});
  const [addOpen, setAddOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<any>(null);
  const [menuRowId, setMenuRowId] = useState<string | null>(null); 
  const openMenu = Boolean(menuAnchor);

  const { data, isLoading, isFetching, isError, refetch } = useListParticipantsQuery({ offset: 0, limit: 50 });
  const [deleteParticipant] = useDeleteParticipantMutation();
  const [regenerateToken] = useRegenerateTokenMutation();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const toast = (message: string, severity: 'success' | 'error' | 'info' = 'info') =>
    setSnackbar({ open: true, message, severity });

  const closeToast = () => setSnackbar({ ...snackbar, open: false });

  function toUrlSafeBase64(str: string) {
    try {
      const utf8 = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_m, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      );
      const b64 = btoa(utf8);
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      try {
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      } catch {
        return '';
      }
    }
  }

  function resolveParticipantId(row: any): string | null {
    if (!row) return null;

    if (typeof row.participantContextId === "string") {
      return row.participantContextId;
    }

    const fallback = [
      row.participantId,
      row.participant_id,
      row.id,
      row.participant,
      row.clientId,
    ];
    for (const f of fallback) {
      if (typeof f === "string" && f.trim().length > 0) return f;
    }

    return null;
  }

async function performDelete(pid: string) {
  try {
    const encoded = toUrlSafeBase64(pid);
    await deleteParticipant(encoded).unwrap();
    toast("Participant deleted successfully.", "success");
    refetch();
  } catch (err) {
    console.error(err);
    toast("Failed to delete participant.", "error");
  }
}

  useEffect(() => {
    const handler = (e: any) => {
      const detail = e.detail;
      if (detail === 'yes') {
        const pid = deleteConfirmRef.current.pid;
        if (pid) {
          performDelete(pid);
          deleteConfirmRef.current = {};
        }
      } else if (detail === 'no') {
        toast('Delete cancelled.', 'info');
        deleteConfirmRef.current = {};
      }
    };
    window.addEventListener('participant-delete-confirm', handler);
    return () => window.removeEventListener('participant-delete-confirm', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = data?.items ?? data ?? [];

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, row: any) => {
    e.stopPropagation();

    console.log("📌 MENU ROW RAW:", row);
    console.log("📌 Keys:", Object.keys(row));

    setMenuAnchor(e.currentTarget);
    setMenuRow(row);

    const resolved = resolveParticipantId(row);
    console.log("📌 RESOLVED PID:", resolved);

    setMenuRowId(resolved);
  };


  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
    setMenuRowId(null);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Header */}
      <Stack direction="column" alignItems="center" sx={{ mb: 3, width: '100%' }}>
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
              Participant Context
            </Typography>
          </Grid2>
        </Grid2>
        <Stack direction="row" justifyContent="flex-end" sx={{ width: '100%', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{
              bgcolor: '#1e1e1e',
              color: '#1273e2ff',
              border: '1px solid #1273e2ff',
              '&:hover': { bgcolor: '#1695b4ff', color: '#000' },
              borderRadius: '20px',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
            }}
          >
            NEW
          </Button>
        </Stack>
      </Stack>

      {/* Loading / Error */}
      {isLoading || isFetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="#f88">Failed to load participants.</Typography>
      ) : items.length === 0 ? (
        <Typography color="#8b949e">No participants found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((p: any, i: number) => {
            const pid = resolveParticipantId(p) ?? `participant-${i}`;
            const did = p.did ?? p.didDocument?.id ?? '';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pid}>
                <Card
                  sx={{
                    bgcolor: '#121212',
                    border: '1px solid #2a2a2a',
                    color: '#fff',
                    cursor: 'pointer',
                    height: 170,
                    borderRadius: '12px',
                    position: 'relative',
                    '&:hover': { borderColor: '#1273e2ff' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => {
                  }}
                >
                  <CardContent sx={{ height: '100%', position: 'relative', pb: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, p)}
                      sx={{ position: 'absolute', right: 6, top: 6, color: '#9aa0a6' }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <Stack direction="row" justifyContent="center" alignItems="flex-start">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff' }}>
                        {p.name ?? pid}
                      </Typography>
                    </Stack>

                    <Stack spacing={0.6} mt={1.5}>
                      <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                        {did || pid}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                        Roles: {(p.roles ?? []).join(', ') || '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                        Active: {p.active ? 'Yes' : 'No'}
                      </Typography>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', px: 1 }}>
                    <IconButton
                      size="small"
                      aria-label="more"
                      sx={{ color: '#8b949e' }}
                      onClick={(e) => handleOpenMenu(e, p)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={openMenu}
        onClose={handleCloseMenu}
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
            handleCloseMenu();
            toast('Open details - not implemented', 'info');
          }}
        >
          Details
        </MenuItem>

        <MenuItem
          onClick={async (e) => {
            e.stopPropagation();
            handleCloseMenu();

            const pid = menuRowId;
            if (!pid) {
              toast("No participant ID found.", "error");
              return;
            }

            try {
              const encoded = toUrlSafeBase64(pid);
              await regenerateToken(encoded).unwrap();
              toast("Token regenerated", "success");
              refetch();
            } catch (err) {
              console.error(err);
              toast("Regenerate token failed", "error");
            }
          }}
        >
          Regenerate Token
        </MenuItem>

        <MenuItem
          sx={{ color: "#ff6b6b" }}
          onClick={(e) => {
            e.stopPropagation();
            handleCloseMenu();

            const pid = menuRowId;   
            if (!pid) {
              toast("No participant ID found.", "error");
              return;
            }

            deleteConfirmRef.current = { pid };
          }}
        >
          Delete
        </MenuItem>



      </Menu>

      <CreateParticipantModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          refetch();
        }}
        onCreated={() => {
          setAddOpen(false);
          refetch();
        }}
      />

      <Snackbar
        open={!!deleteConfirmRef.current.pid}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity="warning"
          sx={{ bgcolor: '#121212', color: '#fff', border: '1px solid #ff4d4d' }}
          action={
            <>
              <Button
                color="error"
                size="small"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent('participant-delete-confirm', { detail: 'yes' }))
                }
              >
                YES
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent('participant-delete-confirm', { detail: 'no' }))
                }
              >
                NO
              </Button>
            </>
          }
        >
          Are you sure you want to delete this participant?
        </Alert>
      </Snackbar>

      {/* bottom-left general toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={closeToast}
      >
        <Alert
          severity={snackbar.severity}
          sx={{
            bgcolor: '#121212',
            color: '#fff',
            border: '1px solid',
            borderColor: snackbar.severity === 'error' ? '#ff4d4d' : snackbar.severity === 'success' ? '#00ff90' : '#00bfff',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
