import React, { useState, useEffect, useRef } from 'react';
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
  Fade,
  IconButton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Stage, Layer, Image as KonvaImage, Rect, Text } from 'react-konva';
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

// Component to render text elements
const ViewCanvasText = ({ element }) => {
  return (
    <Text
      text={element.content || ''}
      x={element.x}
      y={element.y}
      fontSize={element.fontSize || 24}
      fontFamily={element.fontFamily || 'Arial'}
      fill={element.color || '#000000'}
      fontStyle={`${element.bold ? 'bold' : ''} ${element.italic ? 'italic' : ''}`.trim()}
      align={element.align || 'left'}
      width={element.width || 300}
    />
  );
};

// Auto-scrolling canvas display component
const AutoScrollCanvas = ({ pages, dimensions, isAutoScrolling, onUserInteraction }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const scrollIntervalRef = useRef(null);

  // Calculate responsive scale
  useEffect(() => {
    const calculateScale = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 1000); // Max 1000px width
      const scaleX = maxWidth / dimensions.width;
      setScale(Math.min(scaleX, 1));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [dimensions]);

  // Auto-scroll logic
  useEffect(() => {
    if (!isAutoScrolling || pages.length <= 1) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      return;
    }

    scrollIntervalRef.current = setInterval(() => {
      setCurrentPageIndex((prev) => (prev + 1) % pages.length);
    }, 3000); // 3 seconds per page

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling, pages.length]);

  const currentPage = pages[currentPageIndex] || pages[0];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        py: 4,
      }}
      onWheel={onUserInteraction}
      onTouchMove={onUserInteraction}
      onClick={onUserInteraction}
    >
      {/* Page indicator */}
      {pages.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            px: 3,
            py: 1,
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 10,
          }}
        >
          <Typography variant="body2" fontWeight="600">
            Page {currentPageIndex + 1} of {pages.length}
          </Typography>
        </Box>
      )}

      {/* Canvas with fade transition */}
      <Fade in={true} timeout={500} key={currentPageIndex}>
        <Box
          sx={{
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <Stage
            width={dimensions.width * scale}
            height={dimensions.height * scale}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              {/* White background */}
              <Rect
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                fill="white"
              />

              {/* Render page elements */}
              {currentPage?.elements?.map((element) => {
                if (element.type === 'text') {
                  return <ViewCanvasText key={element.id} element={element} />;
                }
                return <ViewCanvasImage key={element.id} element={element} />;
              })}
            </Layer>
          </Stage>
        </Box>
      </Fade>

      {/* Auto-scroll control hint */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          textAlign: 'center',
          color: 'white',
          opacity: 0.8,
        }}
      >
        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
          {isAutoScrolling
            ? 'Click or scroll to pause auto-scroll'
            : pages.length > 1
            ? 'Auto-scroll paused'
            : ''}
        </Typography>
        {pages.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {pages.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentPageIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const InvitationView = () => {
  const { cardId } = useParams();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
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

  const handleUserInteraction = () => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  if (!invitation) {
    return null;
  }

  // Handle both new multi-page format and legacy single-page format
  let pages = [];
  let dimensions = { width: 794, height: 1123 }; // A4 default

  if (invitation.canvasData?.pages) {
    // New multi-page format
    pages = invitation.canvasData.pages;
    dimensions = invitation.canvasData.dimensions || dimensions;
  } else if (invitation.canvasData?.elements) {
    // Legacy single-page format - convert to pages
    pages = [{ id: 1, elements: invitation.canvasData.elements }];
    dimensions = invitation.canvasData.dimensions || dimensions;
  }

  return (
    <Box>
      {/* Full-screen canvas presentation */}
      <AutoScrollCanvas
        pages={pages}
        dimensions={dimensions}
        isAutoScrolling={isAutoScrolling}
        onUserInteraction={handleUserInteraction}
      />

      {/* Auto-scroll control button */}
      {pages.length > 1 && (
        <IconButton
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            bgcolor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'grey.100',
            },
            zIndex: 1000,
          }}
        >
          {isAutoScrolling ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      )}

      {/* Event Details & RSVP Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="md">
          {/* Event Title */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            align="center"
            fontWeight="700"
            sx={{ mb: 4 }}
          >
            {invitation.title}
          </Typography>

          {/* Event Details Card */}
          <Card
            sx={{
              mb: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 32, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Location
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {invitation.eventDetails.location}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <EventIcon sx={{ fontSize: 32, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Date & Time
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {format(new Date(invitation.eventDetails.dateTime), 'PPpp')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {invitation.eventDetails.description && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {invitation.eventDetails.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* RSVP Section */}
          <Paper elevation={3} sx={{ p: 4 }}>
            {submitted ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thank you for your RSVP!
                </Typography>
                <Typography>We look forward to seeing you at the event.</Typography>
              </Alert>
            ) : (
              <Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  align="center"
                  fontWeight="700"
                  color="primary"
                >
                  RSVP
                </Typography>
                <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
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
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes, I'll be there!"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="Sorry, can't make it"
                        />
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
                        size="large"
                        fullWidth
                        disabled={submitting}
                        sx={{
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                          },
                        }}
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
      </Box>

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
