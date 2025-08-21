import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Alert, Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './components/Pages/Home';
import PhotoUpload from './components/PhotoUpload/PhotoUpload';
import TextToSpeech from './components/TextToSpeech/TextToSpeech';
import VideoGeneration from './components/VideoGeneration/VideoGeneration';
import Gallery from './components/Gallery/Gallery';
import Settings from './components/Settings/Settings';
import LoadingOverlay from './components/UI/LoadingOverlay';

// Context
import { AppProvider } from './context/AppContext';
import { SocketProvider } from './context/SocketContext';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

function App() {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    // Check server health on app start
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error('Server is not responding');
      }
      console.log('✅ Server connection established');
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      showNotification('Server connection failed. Some features may not work.', 'warning');
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const showLoading = (message = 'Processing...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider value={{ showNotification, showLoading, hideLoading }}>
        <SocketProvider>
          <Router>
            <Box
              sx={{
                minHeight: '100vh',
                background: `
                  linear-gradient(135deg, #667eea 0%, #764ba2 100%),
                  linear-gradient(45deg, #f093fb 0%, #f5576c 100%),
                  linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)
                `,
                backgroundBlendMode: 'overlay, multiply, normal',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
                  `,
                  pointerEvents: 'none',
                },
              }}
            >
              <Navbar />
              
              <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ minHeight: 'calc(100vh - 140px)', py: 4 }}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <Home />
                          </motion.div>
                        }
                      />
                      <Route
                        path="/upload"
                        element={
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <PhotoUpload />
                          </motion.div>
                        }
                      />
                      <Route
                        path="/text-to-speech"
                        element={
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <TextToSpeech />
                          </motion.div>
                        }
                      />
                      <Route
                        path="/generate"
                        element={
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <VideoGeneration />
                          </motion.div>
                        }
                      />
                      <Route
                        path="/gallery"
                        element={
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <Gallery />
                          </motion.div>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <motion.div
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                          >
                            <Settings />
                          </motion.div>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AnimatePresence>
                </Box>
              </Container>

              <Footer />
              
              {/* Loading Overlay */}
              <LoadingOverlay open={isLoading} message={loadingMessage} />
              
              {/* Notification Snackbar */}
              <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Alert
                  onClose={closeNotification}
                  severity={notification.severity}
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  {notification.message}
                </Alert>
              </Snackbar>
            </Box>
          </Router>
        </SocketProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;