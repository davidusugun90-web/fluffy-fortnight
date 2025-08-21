const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

// Import custom modules
const photoProcessor = require('./services/photoProcessor');
const textToSpeech = require('./services/textToSpeech');
const enhancedTextToSpeech = require('./services/enhancedTextToSpeech');
const backgroundRemover = require('./services/backgroundRemover');
const enhancedBackgroundRemover = require('./services/enhancedBackgroundRemover');
const lipSyncEngine = require('./services/lipSyncEngine');
const animationEngine = require('./services/animationEngine');
const translationService = require('./services/translationService');
const videoGenerator = require('./services/videoGenerator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create necessary directories
const createDirectories = () => {
  const dirs = ['uploads', 'processed', 'videos', 'audio', 'temp'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle real-time processing updates
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Photo Animator Server is running' });
});

// Photo upload and basic editing
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const sessionId = uuidv4();
    const photoData = {
      id: sessionId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };

    // Basic photo processing
    const processedPhoto = await photoProcessor.processPhoto(photoData);

    res.json({
      success: true,
      sessionId,
      photo: processedPhoto
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload and process photo' });
  }
});

// Background removal/replacement (Enhanced with AI)
app.post('/api/background/remove', async (req, res) => {
  try {
    const { sessionId, photoPath, useAI = true } = req.body;

    io.to(sessionId).emit('processing-update', {
      stage: 'background-removal',
      progress: 0,
      message: 'Starting AI background removal...'
    });

    // Use enhanced AI background removal if available
    const result = useAI ? 
      await enhancedBackgroundRemover.removeBackgroundAI(photoPath, (progress, message) => {
        io.to(sessionId).emit('processing-update', {
          stage: 'background-removal',
          progress,
          message: message || 'Removing background with AI...'
        });
      }) :
      await backgroundRemover.removeBackground(photoPath, (progress) => {
        io.to(sessionId).emit('processing-update', {
          stage: 'background-removal',
          progress,
          message: 'Removing background...'
        });
      });

    res.json({
      success: true,
      processedImage: result
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
});

app.post('/api/background/replace', async (req, res) => {
  try {
    const { sessionId, photoPath, backgroundType, customBackground, useAI = true } = req.body;

    const result = useAI ?
      await enhancedBackgroundRemover.generateAIBackground(
        backgroundType,
        customBackground,
        { width: 1920, height: 1080 }, // Default dimensions
        (progress, message) => {
          io.to(sessionId).emit('processing-update', {
            stage: 'background-replacement',
            progress,
            message: message || 'Generating AI background...'
          });
        }
      ) :
      await backgroundRemover.replaceBackground(
        photoPath,
        backgroundType,
        customBackground
      );

    res.json({
      success: true,
      processedImage: result
    });
  } catch (error) {
    console.error('Background replacement error:', error);
    res.status(500).json({ error: 'Failed to replace background' });
  }
});

// Enhanced image processing endpoints
app.post('/api/image/enhance', async (req, res) => {
  try {
    const { sessionId, imagePath, enhancementType = 'auto' } = req.body;

    io.to(sessionId).emit('processing-update', {
      stage: 'image-enhancement',
      progress: 0,
      message: 'Starting image enhancement...'
    });

    const result = await enhancedBackgroundRemover.enhanceImage(imagePath, enhancementType);

    res.json({
      success: true,
      enhancedImage: result
    });
  } catch (error) {
    console.error('Image enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance image' });
  }
});

app.post('/api/image/upscale', async (req, res) => {
  try {
    const { sessionId, imagePath, factor = 2 } = req.body;

    io.to(sessionId).emit('processing-update', {
      stage: 'image-upscaling',
      progress: 0,
      message: 'Starting image upscaling...'
    });

    const result = await enhancedBackgroundRemover.upscaleImage(imagePath, factor);

    res.json({
      success: true,
      upscaledImage: result
    });
  } catch (error) {
    console.error('Image upscaling error:', error);
    res.status(500).json({ error: 'Failed to upscale image' });
  }
});

// Voice cloning endpoint (ElevenLabs)
app.post('/api/tts/clone-voice', async (req, res) => {
  try {
    const { audioSample, voiceName } = req.body;

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(400).json({ error: 'Voice cloning requires ElevenLabs API key' });
    }

    const result = await enhancedTextToSpeech.cloneVoice(audioSample, voiceName);

    res.json({
      success: true,
      clonedVoice: result
    });
  } catch (error) {
    console.error('Voice cloning error:', error);
    res.status(500).json({ error: 'Failed to clone voice' });
  }
});

// API usage statistics
app.get('/api/usage/stats', async (req, res) => {
  try {
    const stats = {
      elevenlabs: null,
      stabilityAI: null
    };

    // Get ElevenLabs usage if available
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        stats.elevenlabs = await enhancedTextToSpeech.getVoiceUsage();
      } catch (error) {
        console.warn('Could not fetch ElevenLabs usage:', error.message);
      }
    }

    // Add Stability AI usage if available
    if (process.env.STABILITY_AI_API_KEY) {
      stats.stabilityAI = {
        available: true,
        service: 'stability-ai'
      };
    }

    res.json({
      success: true,
      usage: stats,
      servicesAvailable: {
        elevenlabs: !!process.env.ELEVENLABS_API_KEY,
        stabilityAI: !!process.env.STABILITY_AI_API_KEY,
        additionalAPI: !!process.env.ADDITIONAL_API_KEY
      }
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

// Text-to-Speech with enhanced voice options
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voice, language, emotion, usePremium = true, sessionId } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: 'Text and voice are required' });
    }

    io.to(sessionId).emit('processing-update', {
      stage: 'tts-generation',
      progress: 0,
      message: 'Generating premium speech...'
    });

    // Use enhanced TTS with ElevenLabs if premium is requested
    const audioResult = usePremium ? 
      await enhancedTextToSpeech.generateEnhancedSpeech(text, voice, { 
        language, 
        emotion 
      }, (progress, message) => {
        io.to(sessionId).emit('processing-update', {
          stage: 'tts-generation',
          progress,
          message: message || 'Synthesizing premium voice...'
        });
      }) :
      await textToSpeech.generateSpeech(text, voice, language, (progress) => {
        io.to(sessionId).emit('processing-update', {
          stage: 'tts-generation',
          progress,
          message: 'Synthesizing voice...'
        });
      });

    res.json({
      success: true,
      audioFile: audioResult.audioFile,
      duration: audioResult.duration,
      phonemes: audioResult.phonemes,
      service: audioResult.service || 'standard',
      quality: audioResult.quality || 'standard',
      emotion: audioResult.emotion || 'neutral'
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Get available voices (Enhanced with premium options)
app.get('/api/tts/voices', async (req, res) => {
  try {
    const { includePremium = true } = req.query;
    
    let voices = await textToSpeech.getAvailableVoices();
    
    // Add enhanced voices if premium is requested
    if (includePremium && process.env.ELEVENLABS_API_KEY) {
      const enhancedVoices = await enhancedTextToSpeech.getEnhancedVoices();
      voices = [...voices, ...enhancedVoices];
    }
    
    res.json({ 
      success: true, 
      voices,
      premiumAvailable: !!process.env.ELEVENLABS_API_KEY,
      totalVoices: voices.length
    });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: 'Failed to get available voices' });
  }
});

// Translation service
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    const translatedText = await translationService.translateText(
      text,
      targetLanguage,
      sourceLanguage
    );

    res.json({
      success: true,
      translatedText,
      sourceLanguage,
      targetLanguage
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// Get supported languages
app.get('/api/translate/languages', async (req, res) => {
  try {
    const languages = await translationService.getSupportedLanguages();
    res.json({ success: true, languages });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ error: 'Failed to get supported languages' });
  }
});

// Lip sync generation
app.post('/api/lipSync/generate', async (req, res) => {
  try {
    const { photoPath, audioFile, sessionId } = req.body;

    io.to(sessionId).emit('processing-update', {
      stage: 'lip-sync',
      progress: 0,
      message: 'Analyzing facial features...'
    });

    const lipSyncData = await lipSyncEngine.generateLipSync(photoPath, audioFile, (progress, stage) => {
      io.to(sessionId).emit('processing-update', {
        stage: 'lip-sync',
        progress,
        message: stage
      });
    });

    res.json({
      success: true,
      lipSyncData
    });
  } catch (error) {
    console.error('Lip sync error:', error);
    res.status(500).json({ error: 'Failed to generate lip sync' });
  }
});

// Animation and movement generation
app.post('/api/animation/generate', async (req, res) => {
  try {
    const { photoPath, animationType, intensity, duration, sessionId } = req.body;

    io.to(sessionId).emit('processing-update', {
      stage: 'animation',
      progress: 0,
      message: 'Generating body movements...'
    });

    const animationData = await animationEngine.generateAnimation(
      photoPath,
      animationType,
      intensity,
      duration,
      (progress) => {
        io.to(sessionId).emit('processing-update', {
          stage: 'animation',
          progress,
          message: 'Creating realistic movements...'
        });
      }
    );

    res.json({
      success: true,
      animationData
    });
  } catch (error) {
    console.error('Animation error:', error);
    res.status(500).json({ error: 'Failed to generate animation' });
  }
});

// Final video generation
app.post('/api/video/generate', async (req, res) => {
  try {
    const {
      photoPath,
      audioFile,
      lipSyncData,
      animationData,
      backgroundData,
      quality = '4k',
      maxDuration = 300, // 5 minutes max
      sessionId
    } = req.body;

    io.to(sessionId).emit('processing-update', {
      stage: 'video-generation',
      progress: 0,
      message: 'Starting video generation...'
    });

    const videoResult = await videoGenerator.generateVideo({
      photoPath,
      audioFile,
      lipSyncData,
      animationData,
      backgroundData,
      quality,
      maxDuration
    }, (progress, stage) => {
      io.to(sessionId).emit('processing-update', {
        stage: 'video-generation',
        progress,
        message: stage
      });
    });

    res.json({
      success: true,
      videoFile: videoResult.videoFile,
      duration: videoResult.duration,
      quality: videoResult.quality,
      fileSize: videoResult.fileSize
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/processed', express.static(path.join(__dirname, 'processed')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 AI Photo Animator Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🎬 Video output directory: ${path.join(__dirname, 'videos')}`);
});

module.exports = app;