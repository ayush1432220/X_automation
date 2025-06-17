// File: frontend/src/components/dashboard/ScheduleForm.tsx
"use client";

import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import SendIcon from '@mui/icons-material/Send';
import { enUS } from 'date-fns/locale';

interface ScheduleFormProps {
  onTweetScheduled: () => void; // Parent component ko update karne ke liye
}

export default function ScheduleForm({ onTweetScheduled }: ScheduleFormProps) {
  const [text, setText] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(new Date());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!text || !scheduledAt) {
      setError('Please fill in both the text and the schedule time.');
      return;
    }
    
    if (text.length > 280) {
      setError('Tweet cannot be more than 280 characters.');
      return;
    }

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Authentication error. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/twitter/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule tweet.');
      }

      setSuccess('Tweet scheduled successfully!');
      setText(''); // Form reset
      onTweetScheduled(); // Parent ko batayein ki list refresh karni hai
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Schedule a New Tweet
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="tweetText"
          label="What's happening?"
          name="tweetText"
          multiline
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          inputProps={{ maxLength: 280 }}
          helperText={`${text.length}/280`}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
          <DateTimePicker
            label="Schedule Date & Time"
            value={scheduledAt}
            onChange={(newValue) => setScheduledAt(newValue)}
            sx={{ width: '100%', mt: 2, mb: 2 }}
          />
        </LocalizationProvider>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 1 }}
          endIcon={<SendIcon />}
        >
          Schedule Tweet
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Box>
    </Paper>
  );
}