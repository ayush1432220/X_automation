// File: frontend/src/app/page.tsx
"use client";

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function LoginPage() {
  const handleLogin = () => {
    // User ko backend ke auth route par redirect karte hain
    window.location.href = 'http://localhost:3000/auth/twitter';
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%' 
          }}
        >
          <Typography component="h1" variant="h5" sx={{ marginBottom: 1 }}>
            X Scheduler
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 3 }}>
            Welcome! Please log in to continue.
          </Typography>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleLogin}
            startIcon={<TwitterIcon />}
            sx={{
              backgroundColor: '#1DA1F2', // Twitter Blue
              '&:hover': {
                backgroundColor: '#0c85d0',
              },
            }}
          >
            Login with Twitter
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}