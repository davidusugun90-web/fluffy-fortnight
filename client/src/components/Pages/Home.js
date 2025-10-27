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
  CardActions,
  Chip,
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  PhotoCamera,
  RecordVoiceOver,
  Movie,
  Translate,
  Animation,
  HighQuality,
  Speed,
  Palette,
  PlayArrow,
  GetApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <PhotoCamera />,
      title: 'Photo Upload & Editing',
      description: 'Upload your photos and apply professional editing with background removal and replacement.',
      color: theme.palette.primary.main,
    },
    {
      icon: <RecordVoiceOver />,
      title: '5 Premium Voices',
      description: 'Choose from 5 high-quality male and female voices with natural speech synthesis.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Translate />,
      title: '40+ Languages',
      description: 'Translate your text to over 40 languages with accurate pronunciation and lip sync.',
      color: theme.palette.success.main,
    },
    {
      icon: <Animation />,
      title: 'Realistic Animation',
      description: 'AI-powered body movements and physics simulation for natural-looking animations.',
      color: theme.palette.warning.main,
    },
    {
      icon: <Movie />,
      title: 'Accurate Lip Sync',
      description: 'Advanced phoneme-based lip synchronization for perfectly matched speech.',
      color: theme.palette.error.main,
    },
    {
      icon: <HighQuality />,
      title: '4K Video Output',
      description: 'Generate stunning 4K videos with realistic color accuracy and smooth motion.',
      color: theme.palette.info.main,
    },
  ];

  const steps = [
    {
      step: 1,
      title: 'Upload Photo',
      description: 'Start by uploading a high-quality photo of a person.',
      icon: <PhotoCamera />,
    },
    {
      step: 2,
      title: 'Add Voice & Text',
      description: 'Enter your text and select from premium voice options.',
      icon: <RecordVoiceOver />,
    },
    {
      step: 3,
      title: 'Customize Settings',
      description: 'Adjust animation, background, and video quality settings.',
      icon: <Palette />,
    },
    {
      step: 4,
      title: 'Generate Video',
      description: 'Let our AI create your stunning talking photo video.',
      icon: <Movie />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Box>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 800,
              }}
            >
              AI Photo Animator
            </Typography>
            
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 4,
                color: 'text.secondary',
                fontWeight: 300,
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              Transform your photos into stunning talking videos with AI-powered
              lip sync, realistic movements, and premium voice synthesis
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/upload')}
                startIcon={<PlayArrow />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                }}
              >
                Start Creating
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/gallery')}
                startIcon={<GetApp />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                }}
              >
                View Gallery
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="4K Quality" color="primary" />
              <Chip label="40+ Languages" color="secondary" />
              <Chip label="Realistic Physics" color="success" />
              <Chip label="Premium Voices" color="warning" />
              <Chip label="5 Min Max" color="info" />
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            component="h3"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 600,
            }}
          >
            Powerful Features
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px rgba(${feature.color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.3)`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: feature.color,
                            mr: 2,
                            width: 56,
                            height: 56,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                      </Box>
                      
                      <Typography
                        variant="h5"
                        component="h4"
                        sx={{ mb: 2, fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            component="h3"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 600,
            }}
          >
            How It Works
          </Typography>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {step.step}
                    </Avatar>
                    
                    <Typography
                      variant="h5"
                      component="h4"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {step.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {step.description}
                    </Typography>

                    {/* Connection line */}
                    {index < steps.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 40,
                          right: -50,
                          width: 100,
                          height: 2,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, transparent 100%)`,
                          display: { xs: 'none', md: 'block' },
                        }}
                      />
                    )}
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Typography
                variant="h3"
                component="h4"
                sx={{ mb: 3, fontWeight: 600 }}
              >
                Ready to Create Magic?
              </Typography>
              
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, fontWeight: 300 }}
              >
                Transform your photos into captivating talking videos with our
                cutting-edge AI technology. No experience required!
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/upload')}
                startIcon={<PlayArrow />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                  },
                }}
              >
                Start Your First Video
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home;