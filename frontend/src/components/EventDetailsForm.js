import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useCardContext } from '../context/CardContext';
import dayjs from 'dayjs';

const EventDetailsForm = () => {
  const { eventDetails, setEventDetails, googleSheetId, setGoogleSheetId } = useCardContext();

  const handleChange = (field) => (event) => {
    setEventDetails({
      ...eventDetails,
      [field]: event.target.value,
    });
  };

  const handleDateTimeChange = (newValue) => {
    setEventDetails({
      ...eventDetails,
      dateTime: newValue ? newValue.toDate() : null,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Event Details
      </Typography>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          label="Event Location"
          fullWidth
          required
          value={eventDetails.location}
          onChange={handleChange('location')}
          placeholder="e.g., Grand Ballroom, Hotel XYZ"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Date & Time"
            value={eventDetails.dateTime ? dayjs(eventDetails.dateTime) : null}
            onChange={handleDateTimeChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              },
            }}
          />
        </LocalizationProvider>

        <TextField
          label="Event Description"
          fullWidth
          multiline
          rows={4}
          value={eventDetails.description}
          onChange={handleChange('description')}
          placeholder="Add any additional details about the event..."
        />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Google Sheets Integration (Optional)
          </Typography>
          <TextField
            label="Google Sheet ID"
            fullWidth
            value={googleSheetId}
            onChange={(e) => setGoogleSheetId(e.target.value)}
            placeholder="Enter your Google Sheet ID for RSVP tracking"
            helperText="RSVPs will be automatically added to your Google Sheet"
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default EventDetailsForm;
