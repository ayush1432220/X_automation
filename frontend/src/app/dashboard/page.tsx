// File: frontend/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, CircularProgress, Button, Grid, Divider, Avatar } from '@mui/material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'; // Naya icon import karein
import ScheduleForm from '@/components/dashboard/ScheduleForm'; 
import TweetList from '@/components/dashboard/TweetList';

// User type ko update karein taaki profileImageUrl bhi include ho
interface User {
  userId: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTweetScheduled = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/me', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Token invalid');
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('jwt_token');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Yeh function ab "Accounts" page par le jaayega
  const handleManageAccounts = () => {
    router.push('/dashboard/accounts');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* User ki profile picture bhi add kar di hai */}
          <Avatar src={user?.profileImageUrl || ''} alt={user?.name || 'User'} />
          <Typography variant="h4" component="h1">
            Welcome, {user?.name || 'User'}!
          </Typography>
        </Box>
        
        {/* --- LOGOUT BUTTON KI JAGAH NAYA BUTTON --- */}
        <Button 
          variant="contained" 
          onClick={handleManageAccounts}
          startIcon={<ManageAccountsIcon />}
        >
          Manage Accounts
        </Button>
        {/* -------------------------------------- */}

      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <ScheduleForm onTweetScheduled={handleTweetScheduled} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Box>
            <TweetList listType="scheduled" refreshTrigger={refreshTrigger} />
            <Divider sx={{ my: 4 }} />
            <TweetList listType="posted" refreshTrigger={refreshTrigger} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}