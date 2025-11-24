import React, { useState } from "react";
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
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useCreateParticipantMutation } from "../apiSlice";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const successKeys = ["apiKey", "clientId", "clientSecret"] as const;
type SuccessKey = typeof successKeys[number];

const CreateParticipantModal: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [participantId, setParticipantId] = useState("");
  const [keyId, setKeyId] = useState("");
  const [privateKeyAlias, setPrivateKeyAlias] = useState("");

  const [createParticipant, { isLoading }] = useCreateParticipantMutation();

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });
  const toast = (msg: string, severity: "success" | "error") => setSnack({ open: true, msg, severity });


  const [successOpen, setSuccessOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ apiKey?: string; clientId?: string; clientSecret?: string } | null>(null);

  const copy = async (value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast("Copied to clipboard", "success");
    } catch {
      toast("Copy failed", "error");
    }
  };

  const handleCreate = async () => {
    if (!participantId) {
      toast("participantId is required", "error");
      return;
    }

    const body = {
      participantId,
      did: `did:web:${participantId}`,
      key: {
        keyGeneratorParams: { algorithm: "EdDSA", curve: "Ed25519" },
        keyId: keyId || `${participantId}-key`,
        privateKeyAlias: privateKeyAlias || `${participantId}-alias`,
      },
      active: true,
      roles: ["ROLE_ADMIN"],
    };

    try {
      const response = await createParticipant(body).unwrap();

      setSuccessData({
        apiKey: response.apiKey,
        clientId: response.clientId,
        clientSecret: response.clientSecret,
      });
      setSuccessOpen(true);

      setParticipantId("");
      setKeyId("");
      setPrivateKeyAlias("");

      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      toast("Failed to create", "error");
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setSuccessData(null);
    onCreated && onCreated();
  };

  return (
    <>
      {/* Create modal */}
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            bgcolor: "#0b0b0b",
            color: "#fff",
            borderRadius: "16px",
            p: 2,
            width: "520px",
            boxShadow: "0 0 30px rgba(0, 180, 255, 0.20)",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "transparent",
              backdropFilter: "blur(4px)",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center", color: "#1695b4ff" }}>
          Create Participant
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Participant ID *"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              fullWidth
              InputLabelProps={{ style: { color: "#bdbdbd" } }}
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c", borderRadius: 8 } }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Key ID (optional)"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: "#bdbdbd" } }}
                InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c", borderRadius: 8 } }}
              />

              <TextField
                label="Private Key Alias (optional)"
                value={privateKeyAlias}
                onChange={(e) => setPrivateKeyAlias(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: "#bdbdbd" } }}
                InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c", borderRadius: 8 } }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderColor: "#00bfff", color: "#00bfff" }}>
            Cancel
          </Button>

          <Button variant="contained" disabled={isLoading} onClick={handleCreate} sx={{ bgcolor: "#1695b4ff", color: "#000", fontWeight: 600 }}>
            {isLoading ? "Saving..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success popup (center) */}
      <Dialog
        open={successOpen}
        onClose={handleSuccessClose}
        PaperProps={{
          sx: {
            bgcolor: "#050506",
            color: "#fff",
            width: { xs: "86vw", sm: "760px" }, 
            borderRadius: "14px",
            p: 3,
            boxShadow: "0 10px 60px rgba(0,120,255,0.28)",
            border: "1px solid rgba(0,140,255,0.10)",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,6,15,0.75)",
              backdropFilter: "blur(6px)",
            },
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: 800, color: "#00bfff" }}>
          Participant Created
        </DialogTitle>

        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ color: "#9aa0a6", textAlign: "center", mb: 1 }}>
            Credentials generated. Copy and store them safely.
          </Typography>

          <Box sx={{ width: "100%", maxWidth: "720px" }}>
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "#9aa0a6", mb: 0.5, display: "block" }}>
                API Key
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  value={successData?.apiKey ?? ""}
                  multiline
                  rows={3}
                  fullWidth
                  inputProps={{
                    readOnly: true,
                    style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace", textAlign: "center" },
                  }}
                  sx={{
                    bgcolor: "#0e0e10",
                    borderRadius: "12px",
                    "& .MuiInputBase-root": { color: "#000000" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.06)" },
                  }}
                />
                <IconButton onClick={() => copy(successData?.apiKey)} sx={{ color: "#00bfff", ml: 0.5 }}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            {/* clientId */}
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "#9aa0a6", mb: 0.5, display: "block" }}>
                Client ID
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "center" }}>
                <TextField
                  value={successData?.clientId ?? ""}
                  fullWidth
                  inputProps={{ readOnly: true, style: { fontFamily: "monospace", textAlign: "center" } }}
                  sx={{
                    maxWidth: "720px",
                    bgcolor: "#0e0e10",
                    borderRadius: "12px",
                    "& .MuiInputBase-root": { color: "#000000" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.06)" },
                  }}
                />
                <IconButton onClick={() => copy(successData?.clientId)} sx={{ color: "#00bfff", ml: 0.5 }}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            {/* clientSecret */}
            <Box sx={{ mb: 1, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "#9aa0a6", mb: 0.5, display: "block" }}>
                Client Secret
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  value={successData?.clientSecret ?? ""}
                  fullWidth
                  inputProps={{ readOnly: true, style: { fontFamily: "monospace", textAlign: "center" } }}
                  sx={{
                    bgcolor: "#0e0e10",
                    borderRadius: "12px",
                    "& .MuiInputBase-root": { color: "#000000" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.06)" },
                  }}
                />
                <IconButton onClick={() => copy(successData?.clientSecret)} sx={{ color: "#00bfff", ml: 0.5 }}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pt: 1 }}>
          <Button onClick={handleSuccessClose} sx={{ borderColor: "#00bfff", color: "#00bfff" }} variant="outlined">
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={1500} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} sx={{ bgcolor: "#121212", color: "#fff" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateParticipantModal;
