import React from 'react';
import { Box, Container, Typography, Button, Paper, Card, CardContent, Grid } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import CreateIcon from '@mui/icons-material/Create';
import ShareIcon from '@mui/icons-material/Share';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, isAuthenticated } = useUser();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/create');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <CloudUploadIcon fontSize="large" color="primary" />,
      title: 'Drag & Drop Design',
      description: 'Upload and arrange images easily'
    },
    {
      icon: <ShareIcon fontSize="large" color="primary" />,
      title: 'Easy Sharing',
      description: 'Get shareable links instantly'
    },
    {
      icon: <CreateIcon fontSize="large" color="primary" />,
      title: 'Google Sheets Integration',
      description: 'Track RSVPs automatically'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
            Welcome to Invitation Card Creator
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Create beautiful invitations and track RSVPs with Google Sheets
          </Typography>

          <Box sx={{ my: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={login}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              Sign in with Google
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            You need to sign in to create and manage invitations
          </Typography>

          {/* Features */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card sx={{ height: '100%', boxShadow: 0, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" gutterBottom fontWeight="600">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
