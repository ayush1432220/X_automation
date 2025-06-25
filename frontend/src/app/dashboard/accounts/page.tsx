"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Paper, Avatar, Button, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Alert } from '@mui/material';

interface User {
    userId: string;
    username: string;
    name: string;
    profileImageUrl: string; // Hum yeh data backend se lenge
}

export default function AccountsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            router.push('/');
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    
                });
                console.log("This is the access token"+token)
                if (!response.ok) throw new Error('Failed to fetch user data.');
                const data = await response.json();
                setUser(data.user);
            } catch (error) {
                console.error(error);
                localStorage.removeItem('jwt_token');
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        router.push('/');
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Connected Accounts</Typography>
            {!user ? (
                <Alert severity="warning">No account found. Please try logging in again.</Alert>
            ) : (
                <List>
                    <ListItem
                        secondaryAction={
                            <Button variant="outlined" color="error" onClick={handleLogout}>
                                Logout
                            </Button>
                        }
                    >
                        <ListItemAvatar>
                            <Avatar alt={user.name} src={user.profileImageUrl} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={user.name}
                            secondary={`@${user.username} - Connected`}
                        />
                    </ListItem>
                </List>
            )}
             {/* Future: Add a button here to "Connect another account" */}
        </Paper>
    );
}