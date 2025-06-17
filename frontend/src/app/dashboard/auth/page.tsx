// File: frontend/src/app/dashboard/auth/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Token ko browser ki local storage mein save karte hain
      localStorage.setItem('jwt_token', token);
      // User ko dashboard par bhejte hain
      router.push('/dashboard');
    } else {
      // Agar token nahi mila, toh login page par wapas bhejte hain
      router.push('/');
    }
  }, [router, searchParams]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Authenticating, please wait...</Typography>
    </Box>
  );
}