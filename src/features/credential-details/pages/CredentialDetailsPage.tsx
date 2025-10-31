import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Grid2
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useListCredentialsQuery } from '../apiSlice';
import CredentialAddDialog from '../components/CredentialAddDialog';
import CredentialDetailsDialog from '../components/CredentialDetailsDialog';
// @ts-ignore
import logo from '../../../assets/styles/tx.png';

const DEFAULT_FILTER_TYPE = 'WalletCredential';

// Mock credentials 
const MOCK_CREDENTIALS = [
  {
    id: 'cred-1',
    verifiableCredentialContainer: {
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'WalletCredential'],
        issuer: 'did:web:domain.com',
        issuanceDate: '2025-10-21T10:00:00Z',
        credentialSubject: [
          {
            id: 'did:web:webpage.com',
            label: 'Primary Wallet',
            walletAddress: '0xABCDEF1234567890',
          },
        ],
      },
    },
  },
  {
    id: 'cred-2',
    verifiableCredentialContainer: {
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'WalletCredential'],
        issuer: 'did:web:another-domain.com',
        issuanceDate: '2025-09-10T15:30:00Z',
        credentialSubject: [
          {
            id: 'did:web:secondary.com',
            label: 'Backup Wallet',
            walletAddress: '0x9876543210ABCDEF',
          },
        ],
      },
    },
  },
];

const CredentialDetailsPage: React.FC = () => {

  const [participantContextId] = useState('demo-participant');
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data = [], refetch } = useListCredentialsQuery(participantContextId, 
    { skip: true } // skip backend for now
  );


  const wallets = data.length
    ? data
    : MOCK_CREDENTIALS.map((r) => ({ id: r.id, raw: r }));


  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<any>(null);
  const openMenu = Boolean(menuAnchor);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>, row: any) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", p: 3 }}>
      {/* Header */}
      <Stack
        direction="column"
        alignItems="center"
        sx={{ mb: 3, width: '100%' }}
      >
        {/* Title */}
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
              Credentials
            </Typography>
          </Grid2>
        </Grid2>


        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ width: '100%', mb: 3 }}
        >
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
            }}
          >
            NEW
          </Button>
        </Stack>
      </Stack>


      {/* Card Grid */}
      <Grid container spacing={2}>
        {wallets.map((wallet, i) => {
          const cred = wallet.raw?.verifiableCredentialContainer?.credential;
          const cs = Array.isArray(cred?.credentialSubject)
            ? cred.credentialSubject[0]
            : {};

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={wallet.id || i}>
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
                }}
                onClick={() => {
                  setSelected(wallet.raw);
                  setDetailsOpen(true);
                }}
              >
                <CardContent sx={{ height: '100%' }}>
                  {/* top-right menu */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMenu(e, wallet);
                    }}
                    sx={{ position: 'absolute', right: 6, top: 6, color: '#9aa0a6' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>

                  {/* top row: name + logo */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: '#ffffff' }}
                    >
                      {(cs?.label as string) || 'Name'}
                    </Typography>
                    <Box
                      component="img"
                      src={logo}
                      alt="Logo"
                      sx={{
                        width: 44,
                        height: 44,
                        objectFit: 'contain',
                        position: 'absolute',
                        top: '15px',
                        right: '25px',
                        borderRadius: '6px',
                        ml: 1,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Stack>

                  {/* middle */}
                  <Stack spacing={0.6} mt={1.5}>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                      {cred?.type?.[1] ?? 'WalletCredential'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                      Expiration Date
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                      {cred?.issuer ?? 'did:web:domain.com'}
                    </Typography>
                  </Stack>


                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Per-card menu */}
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
        <MenuItem onClick={handleCloseMenu}>Details</MenuItem>
      </Menu>

      {/* Dialogs */}
      <CredentialAddDialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          refetch();
        }}
        participantContextId={participantContextId}
      />
      <CredentialDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        credential={selected}
      />
    </Box>
  );
};

export default CredentialDetailsPage;
