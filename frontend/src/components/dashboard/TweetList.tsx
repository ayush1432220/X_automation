// File: frontend/src/components/dashboard/TweetList.tsx
"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

interface Tweet {
  _id: string;
  text: string;
  status: 'scheduled' | 'posted' | 'failed';
  scheduledAt?: string;
  postedAt?: string;
}

interface TweetListProps {
  listType: 'scheduled' | 'posted';
  refreshTrigger: number; // Iske change hone par list refresh hogi
}

export default function TweetList({ listType, refreshTrigger }: TweetListProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTweets = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('Not authenticated.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/twitter/${listType}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`Failed to fetch ${listType} tweets.`);
        const data = await response.json();
        setTweets(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [listType, refreshTrigger]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
        {listType} Tweets
      </Typography>
      {tweets.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No {listType} tweets found.
        </Typography>
      ) : (
        <List dense>
          {tweets.map((tweet) => (
            <ListItem key={tweet._id}>
              <ListItemText
                primary={tweet.text}
                secondary={
                  listType === 'scheduled'
                    ? `Scheduled for: ${new Date(tweet.scheduledAt!).toLocaleString()}`
                    : `Posted on: ${new Date(tweet.postedAt!).toLocaleString()}`
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}