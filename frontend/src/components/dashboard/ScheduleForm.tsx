"use client";

import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Collapse, IconButton } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import SendIcon from '@mui/icons-material/Send';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import EventIcon from '@mui/icons-material/Event';
import { enUS } from 'date-fns/locale';

interface ScheduleFormProps {
    onTweetScheduled: () => void;
}

export default function ScheduleForm({ onTweetScheduled }: ScheduleFormProps) {
    const [text, setText] = useState('');
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleApiCall = async (endpoint: string, body: object) => {
        setError('');
        setSuccess('');
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            setError('Authentication error. Please log in again.');
            return;
        } 

        try {
            const response = await fetch(`http://localhost:3000/twitter/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'An error occurred.');
            
            setSuccess(`Tweet ${endpoint === 'schedule' ? 'scheduled' : 'posted'} successfully!`);
            setText('');
            setShowDateTimePicker(false);
            setScheduledAt(null);
            onTweetScheduled();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!text) {
            setError('Tweet text cannot be empty.');
            return;
        }
        handleApiCall('post', { text });
    };
    
    const handleSchedule = (event: React.FormEvent) => {
        event.preventDefault();
         if (!text || !scheduledAt) {
            setError('Please provide text and a valid schedule time.');
            return;
        }
        handleApiCall('schedule', { text, scheduledAt: scheduledAt.toISOString() });
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Compose Tweet</Typography>
            <Box component="form" noValidate>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="What's happening?"
                    multiline
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    inputProps={{ maxLength: 280 }}
                    helperText={`${text.length}/280`}
                />

                <Collapse in={showDateTimePicker}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
                        <DateTimePicker
                            label="Schedule Date & Time"
                            value={scheduledAt}
                            onChange={(newValue) => setScheduledAt(newValue)}
                            sx={{ width: '100%', my: 2 }}
                            disablePast
                        />
                    </LocalizationProvider>
                </Collapse>

                {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<EventIcon />}
                        onClick={() => setShowDateTimePicker(!showDateTimePicker)}
                    >
                        Schedule
                    </Button>
                    
                    {showDateTimePicker ? (
                         <Button
                            variant="contained"
                            endIcon={<ScheduleSendIcon />}
                            onClick={handleSchedule}
                         >
                            Schedule Post
                         </Button>
                    ) : (
                        <Button
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={handleSubmit}
                        >
                            Post
                        </Button>
                    )}
                </Box>
            </Box>
        </Paper>
    );
}