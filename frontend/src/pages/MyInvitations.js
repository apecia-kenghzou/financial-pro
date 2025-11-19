import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { invitationAPI } from '../services/api';
import { useUser } from '../context/UserContext';

const MyInvitations = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useUser();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, cardId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated) {
      fetchInvitations();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await invitationAPI.getAll();
      setInvitations(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cardId) => {
    navigate(`/edit/${cardId}`);
  };

  const handleViewRSVPs = (cardId) => {
    navigate(`/rsvp-dashboard/${cardId}`);
  };

  const handleShare = (cardId) => {
    const link = `${window.location.origin}/invitation/${cardId}`;
    navigator.clipboard.writeText(link);
    setSnackbar({
      open: true,
      message: 'Invitation link copied to clipboard!',
      severity: 'success',
    });
  };

  const handleDeleteClick = (cardId) => {
    setDeleteDialog({ open: true, cardId });
  };

  const handleDeleteConfirm = async () => {
    try {
      await invitationAPI.delete(deleteDialog.cardId);
      setSnackbar({
        open: true,
        message: 'Invitation deleted successfully',
        severity: 'success',
      });
      setDeleteDialog({ open: false, cardId: null });
      fetchInvitations(); // Refresh list
    } catch (err) {
      console.error('Error deleting invitation:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete invitation',
        severity: 'error',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            My Invitations
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create')}
            size="large"
          >
            Create New
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {invitations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No invitations yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first invitation card to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create')}
            >
              Create Invitation
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {invitations.map((invitation) => (
              <Grid item xs={12} sm={6} md={4} key={invitation.cardId}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {invitation.title}
                      </Typography>
                      <Chip
                        label={invitation.isPublished ? 'Published' : 'Draft'}
                        color={invitation.isPublished ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Location:</strong> {invitation.eventDetails.location}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Date:</strong>{' '}
                      {format(new Date(invitation.eventDetails.dateTime), 'PPP p')}
                    </Typography>

                    {invitation.eventDetails.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {invitation.eventDetails.description}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      Created: {format(new Date(invitation.createdAt), 'PP')}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(invitation.cardId)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(invitation.cardId)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Box>
                      {invitation.isPublished && (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleShare(invitation.cardId)}
                            title="Copy Link"
                          >
                            <ShareIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleViewRSVPs(invitation.cardId)}
                            title="View RSVPs"
                          >
                            <PeopleIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, cardId: null })}>
          <DialogTitle>Delete Invitation?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this invitation? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, cardId: null })}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

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
      </Container>
    </Box>
  );
};

export default MyInvitations;
