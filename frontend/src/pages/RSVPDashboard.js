import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';
import { rsvpAPI, invitationAPI } from '../services/api';
import { useUser } from '../context/UserContext';

const RSVPDashboard = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useUser();
  const [invitation, setInvitation] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated && cardId) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, cardId, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch invitation details
      const inviteResponse = await invitationAPI.getById(cardId);
      setInvitation(inviteResponse.data.data);

      // Fetch RSVPs
      const rsvpResponse = await rsvpAPI.getForCard(cardId);
      setRsvps(rsvpResponse.data.data);
      setStats(rsvpResponse.data.stats);

      setError(null);
    } catch (err) {
      console.error('Error fetching RSVP data:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to view these RSVPs');
      } else {
        setError('Failed to load RSVP data');
      }
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/my-invitations')}>
          Back to My Invitations
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-invitations')}
          sx={{ mb: 3 }}
        >
          Back to My Invitations
        </Button>

        {invitation && (
          <>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              {invitation.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" gutterBottom>
              {invitation.eventDetails.location} •{' '}
              {format(new Date(invitation.eventDetails.dateTime), 'PPP p')}
            </Typography>

            {/* Stats Cards */}
            {stats && (
              <Grid container spacing={3} sx={{ my: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Responses
                      </Typography>
                      <Typography variant="h4">{stats.total}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'success.light' }}>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Attending
                      </Typography>
                      <Typography variant="h4">{stats.attending}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'error.light' }}>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Not Attending
                      </Typography>
                      <Typography variant="h4">{stats.notAttending}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: 'primary.light' }}>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Guests
                      </Typography>
                      <Typography variant="h4">{stats.totalGuests}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* RSVP Table */}
            <Paper sx={{ mt: 3 }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon /> Guest List
                </Typography>
              </Box>

              {rsvps.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No RSVPs yet. Share your invitation link to start receiving responses!
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Phone</strong></TableCell>
                        <TableCell align="center"><strong>Guests</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                        <TableCell><strong>Message</strong></TableCell>
                        <TableCell><strong>Submitted</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rsvps.map((rsvp) => (
                        <TableRow key={rsvp._id} hover>
                          <TableCell>{rsvp.name}</TableCell>
                          <TableCell>{rsvp.email}</TableCell>
                          <TableCell>{rsvp.phone || '-'}</TableCell>
                          <TableCell align="center">{rsvp.numberOfGuests}</TableCell>
                          <TableCell align="center">
                            {rsvp.attending ? (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Attending"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<CancelIcon />}
                                label="Not Attending"
                                color="error"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {rsvp.message || '-'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(rsvp.createdAt), 'PP p')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default RSVPDashboard;
