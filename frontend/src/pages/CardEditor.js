import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import GetAppIcon from '@mui/icons-material/GetApp';
import ShareIcon from '@mui/icons-material/Share';
import CanvasEditor from '../components/CanvasEditor';
import EventDetailsForm from '../components/EventDetailsForm';
import PageNavigator from '../components/PageNavigator';
import AssetLibrary from '../components/AssetLibrary';
import SaveIndicator from '../components/SaveIndicator';
import { useCardContext } from '../context/CardContext';
import { useUser } from '../context/UserContext';
import { invitationAPI } from '../services/api';
import confetti from 'canvas-confetti';

const CardEditor = () => {
  const navigate = useNavigate();
  const { cardId } = useParams(); // Get cardId from URL for edit mode
  const { isAuthenticated, loading: authLoading } = useUser();
  const {
    currentCard,
    setCurrentCard,
    canvasElements,
    setCanvasElements,
    pages,
    setPages,
    eventDetails,
    setEventDetails,
    googleSheetId,
    setGoogleSheetId,
    resetCard,
    loadLegacyCard,
    A4_DIMENSIONS,
  } = useCardContext();

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCard, setLoadingCard] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [publishDialog, setPublishDialog] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error', 'unsaved'
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/create' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load existing card for editing
  useEffect(() => {
    if (cardId && isAuthenticated) {
      loadExistingCard(cardId);
    } else if (!cardId) {
      // Reset form when creating new card
      resetCard();
      setTitle('');
    }
  }, [cardId, isAuthenticated]);

  // Track unsaved changes
  useEffect(() => {
    if (currentCard) {
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');
    }
  }, [pages, eventDetails, title, googleSheetId]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !currentCard) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, pages, eventDetails, title, googleSheetId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [title, pages, eventDetails, googleSheetId]);

  const loadExistingCard = async (id) => {
    try {
      setLoadingCard(true);
      const response = await invitationAPI.getById(id);
      const card = response.data.data;

      // Populate form fields
      setTitle(card.title);
      setCurrentCard(card);

      // Populate canvas - handle both multi-page and legacy formats
      if (card.canvasData) {
        if (card.canvasData.pages) {
          // New multi-page format
          setPages(card.canvasData.pages);
        } else if (card.canvasData.elements) {
          // Legacy single-page format - convert to pages
          loadLegacyCard(card.canvasData.elements);
        }
      }

      // Populate event details
      if (card.eventDetails) {
        setEventDetails(card.eventDetails);
      }

      // Populate Google Sheet ID
      if (card.googleSheetId) {
        setGoogleSheetId(card.googleSheetId);
      }

    } catch (error) {
      console.error('Error loading card:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load invitation card',
        severity: 'error',
      });
      navigate('/my-invitations');
    } finally {
      setLoadingCard(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a title for your invitation',
        severity: 'error',
      });
      return;
    }

    // Check if there's at least one element across all pages
    const totalElements = pages.reduce((sum, page) => sum + page.elements.length, 0);
    if (totalElements === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one element to your canvas',
        severity: 'error',
      });
      return;
    }

    if (!eventDetails.location || !eventDetails.dateTime) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required event details',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    setSaveStatus('saving');
    try {
      const data = {
        title,
        canvasData: {
          pages: pages,
          dimensions: A4_DIMENSIONS,
        },
        eventDetails,
        googleSheetId,
      };

      let response;
      if (currentCard) {
        response = await invitationAPI.update(currentCard.cardId, data);
      } else {
        response = await invitationAPI.create(data);
      }

      setCurrentCard(response.data.data);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setSnackbar({
        open: true,
        message: 'Invitation card saved successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving card:', error);
      setSaveStatus('error');
      setSnackbar({
        open: true,
        message: 'Failed to save invitation card',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!title.trim() || !currentCard) return;

    setSaveStatus('saving');
    try {
      const data = {
        title,
        canvasData: {
          pages: pages,
          dimensions: A4_DIMENSIONS,
        },
        eventDetails,
        googleSheetId,
      };

      await invitationAPI.update(currentCard.cardId, data);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
    }
  };

  const handlePublish = async () => {
    if (!currentCard) {
      setSnackbar({
        open: true,
        message: 'Please save your invitation first',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await invitationAPI.publish(currentCard.cardId);
      const link = response.data.data.shareableLink;
      setShareableLink(link);
      setPublishDialog(true);

      // Celebrate with confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSnackbar({
        open: true,
        message: 'Invitation published successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error publishing card:', error);
      setSnackbar({
        open: true,
        message: 'Failed to publish invitation card',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      title,
      canvasData: {
        pages: pages,
        dimensions: A4_DIMENSIONS,
      },
      eventDetails,
      googleSheetId,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'invitation'}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: 'Design exported successfully!',
      severity: 'success',
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard!',
      severity: 'success',
    });
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading while card is being loaded
  if (loadingCard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h1" gutterBottom>
                {cardId ? 'Edit Your Invitation Card' : 'Create Your Invitation Card'}
              </Typography>
              <TextField
                fullWidth
                label="Invitation Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., My Wedding Invitation"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                <SaveIndicator status={saveStatus} />
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  onClick={handleExportJSON}
                  disabled={pages.reduce((sum, p) => sum + p.elements.length, 0) === 0}
                >
                  Export JSON
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PublishIcon />}
                  onClick={handlePublish}
                  disabled={!currentCard || loading}
                >
                  Publish
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <CanvasEditor />
              <AssetLibrary />
            </Box>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <PageNavigator />
              <EventDetailsForm />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Publish Dialog */}
      <Dialog open={publishDialog} onClose={() => setPublishDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShareIcon color="primary" />
            Your Invitation is Published!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Share this link with your guests:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', mt: 2, wordBreak: 'break-all' }}>
            <Typography variant="body2">{shareableLink}</Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialog(false)}>Close</Button>
          <Button variant="contained" onClick={handleCopyLink}>
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default CardEditor;
