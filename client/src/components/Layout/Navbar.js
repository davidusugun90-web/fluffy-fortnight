import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  PhotoCamera,
  RecordVoiceOver,
  Movie,
  VideoLibrary,
  Settings,
  Home,
  Close,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  
  const { state } = useAppContext();
  const { isConnected } = useSocket();

  const menuItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Upload', path: '/upload', icon: <PhotoCamera /> },
    { label: 'Voice', path: '/text-to-speech', icon: <RecordVoiceOver /> },
    { label: 'Generate', path: '/generate', icon: <Movie /> },
    { label: 'Gallery', path: '/gallery', icon: <VideoLibrary /> },
    { label: 'Settings', path: '/settings', icon: <Settings /> },
  ];

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Brand */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer' 
          }}
          onClick={() => navigate('/')}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                mr: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <PhotoCamera />
            </Avatar>
          </motion.div>
          
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            AI Photo Animator
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: isActivePath(item.path) ? 'primary.main' : 'text.primary',
                  fontWeight: isActivePath(item.path) ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  },
                  position: 'relative',
                  '&::after': isActivePath(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: 2,
                    backgroundColor: 'primary.main',
                    borderRadius: 1,
                  } : {},
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Status Indicators and Mobile Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Connection Status */}
          <Chip
            label={isConnected ? 'Connected' : 'Offline'}
            size="small"
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
            sx={{ 
              fontSize: '0.75rem',
              display: { xs: 'none', sm: 'flex' }
            }}
          />

          {/* Processing Status */}
          {state.isProcessing && (
            <Chip
              label="Processing..."
              size="small"
              color="primary"
              variant="filled"
              sx={{ 
                fontSize: '0.75rem',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                  '100%': { opacity: 1 },
                },
              }}
            />
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          PaperProps={{
            sx: {
              background: 'rgba(26, 26, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              mt: 1,
              minWidth: 200,
            },
          }}
        >
          {/* Mobile Menu Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Menu
              </Typography>
              <IconButton size="small" onClick={handleMobileMenuClose}>
                <Close />
              </IconButton>
            </Box>
            
            {/* Connection status in mobile menu */}
            <Box sx={{ mt: 1 }}>
              <Chip
                label={isConnected ? 'Connected' : 'Offline'}
                size="small"
                color={isConnected ? 'success' : 'error'}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Box>

          {/* Mobile Menu Items */}
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                py: 1.5,
                px: 2,
                color: isActivePath(item.path) ? 'primary.main' : 'text.primary',
                backgroundColor: isActivePath(item.path) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {item.icon}
                <Typography variant="body1" sx={{ fontWeight: isActivePath(item.path) ? 600 : 400 }}>
                  {item.label}
                </Typography>
              </Box>
            </MenuItem>
          ))}

          {/* Current Project Info */}
          {state.projectName && (
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="caption" color="text.secondary">
                Current Project:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                {state.projectName}
              </Typography>
            </Box>
          )}
        </Menu>
      </Toolbar>

      {/* Progress Bar for Processing */}
      {state.isProcessing && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ transformOrigin: 'left' }}
        >
          <Box
            sx={{
              height: 3,
              background: `linear-gradient(90deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.secondary.main} 100%)`,
              animation: 'shimmer 2s infinite',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' },
              },
              backgroundSize: '200% 100%',
            }}
          />
        </motion.div>
      )}
    </AppBar>
  );
};

export default Navbar;