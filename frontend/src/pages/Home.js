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
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import StyleIcon from '@mui/icons-material/Style';
import ShareIcon from '@mui/icons-material/Share';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useUser } from '../context/UserContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  const features = [
    {
      icon: <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Drag & Drop Design',
      description: 'Upload images or use pre-made assets on your A4 canvas with multi-page support',
    },
    {
      icon: <StyleIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Rich Elements',
      description: 'Add text labels, maps, calendars, flowers, and decorative patterns',
    },
    {
      icon: <ShareIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Stunning View',
      description: 'Auto-scrolling, mobile-responsive presentation that wows your guests',
    },
    {
      icon: <CreateIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'RSVP Tracking',
      description: 'Track guest responses automatically and sync with Google Sheets',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section - Single CTA */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background shape */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '40%',
            height: '120%',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              fontWeight="800"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 3,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              Create Beautiful
              <br />
              Invitation Cards
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mb: 5,
                opacity: 0.95,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                fontWeight: 300,
              }}
            >
              Professional A4-sized invitations with multi-page support, pre-made assets,
              and stunning auto-scroll presentation
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<CreateIcon />}
              onClick={() => navigate(isAuthenticated ? '/create' : '/login')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isAuthenticated ? 'Create Invitation' : 'Get Started Free'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            gutterBottom
            fontWeight="700"
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Everything You Need
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: '600px', margin: '0 auto' }}
          >
            Professional tools to create stunning invitation cards in minutes
          </Typography>
        </Box>

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
                  p: 3,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
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

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              gutterBottom
              fontWeight="700"
              sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
            >
              How It Works
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="center">
            {[
              { num: '1', title: 'Design', desc: 'Choose from pre-made assets or upload your own images to our A4 canvas' },
              { num: '2', title: 'Customize', desc: 'Add text, maps, calendars, and arrange elements across multiple pages' },
              { num: '3', title: 'Publish', desc: 'Share a stunning auto-scrolling link that works perfectly on mobile' },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      margin: '0 auto 20px',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    {step.num}
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight="600">
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
