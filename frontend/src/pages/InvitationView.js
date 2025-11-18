import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Snackbar,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { invitationAPI, rsvpAPI } from '../services/api';
import { format } from 'date-fns';

// Component to render canvas images
const ViewCanvasImage = ({ element }) => {
  const [image] = useImage(element.src);
  return (
    <KonvaImage
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
    />
  );
};

const InvitationView = () => {
  const { cardId } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfGuests: 1,
    attending: 'yes',
    message: '',
  });

  useEffect(() => {
    fetchInvitation();
  }, [cardId]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getById(cardId);
      const data = response.data.data;

      if (!data.isPublished) {
        setError('This invitation is not yet published');
        return;
      }

      setInvitation(data);
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Invitation not found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      await rsvpAPI.submit({
        cardId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        numberOfGuests: parseInt(formData.numberOfGuests),
        attending: formData.attending === 'yes',
        message: formData.message,
      });

      setSubmitted(true);
      setSnackbar({
        open: true,
        message: 'RSVP submitted successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit RSVP';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!invitation) {
    return null;
  }

  const canvasElements = invitation.canvasData?.elements || [];
  const stageDimensions = invitation.canvasData?.dimensions || { width: 800, height: 600 };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
            {invitation.title}
          </Typography>

          {/* Canvas Display */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              my: 4,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Stage width={stageDimensions.width} height={stageDimensions.height}>
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={stageDimensions.width}
                  height={stageDimensions.height}
                  fill="white"
                />
                {canvasElements.map((element) => (
                  <ViewCanvasImage key={element.id} element={element} />
                ))}
              </Layer>
            </Stage>
          </Box>

          {/* Event Details */}
          <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon />
                    <Box>
                      <Typography variant="subtitle2">Location</Typography>
                      <Typography variant="h6">{invitation.eventDetails.location}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon />
                    <Box>
                      <Typography variant="subtitle2">Date & Time</Typography>
                      <Typography variant="h6">
                        {format(new Date(invitation.eventDetails.dateTime), 'PPpp')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {invitation.eventDetails.description && (
                  <Grid item xs={12}>
                    <Typography variant="body1">{invitation.eventDetails.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Divider sx={{ my: 4 }} />

          {/* RSVP Form */}
          {submitted ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6">Thank you for your RSVP!</Typography>
              <Typography>We look forward to seeing you at the event.</Typography>
            </Alert>
          ) : (
            <Box>
              <Typography variant="h4" gutterBottom align="center" color="secondary">
                RSVP
              </Typography>
              <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
                Please let us know if you can make it
              </Typography>

              <form onSubmit={handleSubmitRSVP}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Your Name"
                      value={formData.name}
                      onChange={handleChange('name')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleChange('email')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Number of Guests"
                      value={formData.numberOfGuests}
                      onChange={handleChange('numberOfGuests')}
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormLabel component="legend">Will you be attending?</FormLabel>
                    <RadioGroup
                      row
                      value={formData.attending}
                      onChange={handleChange('attending')}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes, I'll be there!" />
                      <FormControlLabel value="no" control={<Radio />} label="Sorry, can't make it" />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Message (Optional)"
                      value={formData.message}
                      onChange={handleChange('message')}
                      placeholder="Any special requests or messages..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                      disabled={submitting}
                    >
                      {submitting ? <CircularProgress size={24} /> : 'Submit RSVP'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvitationView;
