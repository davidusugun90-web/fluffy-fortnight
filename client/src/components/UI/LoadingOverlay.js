import React from 'react';
import {
  Backdrop,
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingOverlay = ({ open, message = 'Processing...', progress = null, stage = '' }) => {
  const theme = useTheme();

  const overlayVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: theme.zIndex.modal + 1,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(15, 15, 35, 0.8)',
          }}
          open={open}
        >
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                minWidth: 400,
                maxWidth: 500,
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                {/* Main loading animation */}
                <Box sx={{ mb: 3 }}>
                  <motion.div variants={pulseVariants} animate="pulse">
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Outer ring */}
                      <CircularProgress
                        size={80}
                        thickness={2}
                        sx={{
                          color: theme.palette.primary.main,
                          position: 'absolute',
                        }}
                      />
                      
                      {/* Inner progress ring (if progress is available) */}
                      {progress !== null && (
                        <CircularProgress
                          variant="determinate"
                          value={progress}
                          size={80}
                          thickness={4}
                          sx={{
                            color: theme.palette.secondary.main,
                            position: 'absolute',
                          }}
                        />
                      )}
                      
                      {/* Center icon/text */}
                      <Box
                        sx={{
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.2)',
                          border: '2px solid rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                          }}
                        >
                          AI
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Box>

                {/* Progress percentage */}
                {progress !== null && (
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {Math.round(progress)}%
                  </Typography>
                )}

                {/* Main message */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {message}
                </Typography>

                {/* Stage information */}
                {stage && (
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 3,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                    }}
                  >
                    {stage}
                  </Typography>
                )}

                {/* Progress bar */}
                {progress !== null && (
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Processing stages indicator */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  {['Photo', 'Voice', 'Sync', 'Video'].map((stageLabel, index) => (
                    <Box
                      key={stageLabel}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: stage.toLowerCase().includes(stageLabel.toLowerCase()) 
                          ? theme.palette.primary.main
                          : 'rgba(255, 255, 255, 0.3)',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  ))}
                </Box>

                {/* Animated dots */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 3 }}>
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.secondary.main,
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>

                {/* Tips or additional info */}
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    display: 'block',
                  }}
                >
                  Creating your AI-powered video with premium quality...
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;