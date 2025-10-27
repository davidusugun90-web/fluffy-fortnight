import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  GitHub,
  Twitter,
  LinkedIn,
  Email,
  Favorite,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <GitHub />, url: 'https://github.com', label: 'GitHub' },
    { icon: <Twitter />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <LinkedIn />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <Email />, url: 'mailto:contact@aiphotoanimator.com', label: 'Email' },
  ];

  const features = [
    '4K Video Output',
    '40+ Languages',
    '5 Premium Voices',
    'Real Physics',
    'AI Lip Sync',
    'Background AI'
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        mt: 'auto',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Brand and Description */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              AI Photo Animator
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400 }}>
              Transform your photos into stunning talking videos with AI-powered 
              lip sync, realistic movements, and premium voice synthesis.
            </Typography>

            {/* Feature chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.7rem',
                    height: 24,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'text.secondary',
                  }}
                />
              ))}
            </Box>
          </Grid>

          {/* Social Links and Contact */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Connect With Us
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 2 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component={Link}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>

              <Typography variant="body2" color="text.secondary">
                Need help? Contact us at{' '}
                <Link
                  href="mailto:support@aiphotoanimator.com"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  support@aiphotoanimator.com
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Copyright */}
          <Typography variant="body2" color="text.secondary">
            © {currentYear} AI Photo Animator. All rights reserved.
          </Typography>

          {/* Made with love */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Made with
            </Typography>
            <Favorite sx={{ color: 'error.main', fontSize: 16 }} />
            <Typography variant="body2" color="text.secondary">
              using AI technology
            </Typography>
          </Box>

          {/* Version and tech stack */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="v1.0.0"
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: 20,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.secondary',
              }}
            />
            <Chip
              label="React + Node.js"
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                height: 20,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.secondary',
              }}
            />
          </Box>
        </Box>

        {/* Legal links */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {['Privacy Policy', 'Terms of Service', 'API Documentation', 'Support'].map((linkText) => (
            <Link
              key={linkText}
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.8rem',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {linkText}
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;