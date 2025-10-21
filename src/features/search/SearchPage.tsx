import { Box, Typography } from "@mui/material";

export default function SearchPage() {
  return (
    <Box
      sx={{
        p: 3,
        color: "#f0f6fc",
        backgroundColor: "transparent",
        minHeight: "80vh",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Search
      </Typography>
      <Typography variant="h3" color="#8b949e">
        The search interface will appear here once backend integration is ready.
      </Typography>
    </Box>
  );
}