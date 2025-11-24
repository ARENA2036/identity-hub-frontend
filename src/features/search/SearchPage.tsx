import { Box, Typography , Grid2} from "@mui/material";

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
              Search
            </Typography>
          </Grid2>
        </Grid2>

      <Typography variant="h3" color="#8b949e">
        The search interface will appear here once backend integration is ready.
      </Typography>
    </Box>
  );
}