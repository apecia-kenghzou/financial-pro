import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import StyleIcon from '@mui/icons-material/Style';
import ShareIcon from '@mui/icons-material/Share';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Drag & Drop Design',
      description: 'Easily upload and arrange PNG images on your canvas to create stunning designs',
    },
    {
      icon: <StyleIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Custom Templates',
      description: 'Start from scratch or use pre-made templates to speed up your design process',
    },
    {
      icon: <ShareIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Easy Sharing',
      description: 'Publish your invitation and get a shareable link to send to all your guests',
    },
    {
      icon: <CreateIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'RSVP Tracking',
      description: 'Track guest responses automatically and sync with Google Sheets',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Create Beautiful Invitation Cards
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Design, customize, and share your perfect invitation in minutes
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<CreateIcon />}
                onClick={() => navigate('/create')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Start Creating
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 3,
                }}
              >
                <Typography variant="h5" color="text.primary" gutterBottom>
                  Why Choose Us?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Our intuitive drag-and-drop interface makes it easy for anyone to create
                  professional-looking invitation cards. No design experience needed!
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="600">
          Key Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to create and share amazing invitations
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
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
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom fontWeight="600">
            Ready to Create Your Invitation?
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who have created beautiful invitations
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/create')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
