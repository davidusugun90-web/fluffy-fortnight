# AI Photo Animator

Transform your photos into stunning talking videos with AI-powered lip sync, realistic movements, and premium voice synthesis.

![AI Photo Animator](https://img.shields.io/badge/AI-Photo%20Animator-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

### Core Capabilities
- **📸 Photo Upload & Editing**: Professional photo processing with background removal and replacement
- **🎤 Premium Text-to-Speech**: 5 high-quality male and female voices with natural speech synthesis
- **🌍 Multi-Language Support**: 40+ languages with accurate pronunciation and translation
- **👄 Advanced Lip Sync**: AI-powered phoneme-based lip synchronization for perfect speech matching
- **🎭 Realistic Animation**: Physics-based body movements and natural micro-expressions
- **🎬 4K Video Output**: Ultra-high-definition video generation with color accuracy
- **⚡ Real-time Processing**: Live progress updates via WebSocket connections
- **🎨 Background Customization**: Remove, replace, or enhance backgrounds with AI

### Technical Features
- **Real Physics Simulation**: Advanced physics engine for natural body movements
- **Color Accuracy**: Professional-grade color processing for 4K content
- **Optimized Performance**: Efficient processing with 3-5 minute video length support
- **Modern UI/UX**: Beautiful, responsive interface with smooth animations
- **WebSocket Integration**: Real-time progress updates and processing status
- **Modular Architecture**: Clean, maintainable codebase with service-oriented design

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- FFmpeg installed on your system
- Optional: Google Cloud credentials for enhanced TTS and translation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-photo-animator.git
   cd ai-photo-animator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   # Add API keys for enhanced features (optional)
   ```

4. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start separately:
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📋 Usage Guide

### Step 1: Upload Photo
- Click "Start Creating" or navigate to `/upload`
- Upload a high-quality photo of a person (JPEG, PNG, WebP supported)
- The AI will automatically detect faces and analyze the image

### Step 2: Add Voice & Text
- Enter your text (up to 5 minutes of speech)
- Choose from 5 premium voices (male/female options)
- Select target language from 40+ supported languages
- Preview the generated audio

### Step 3: Customize Settings
- **Animation Type**: Choose from subtle, natural, expressive, dramatic, or presentation styles
- **Animation Intensity**: Adjust movement strength (0.1 - 1.0)
- **Background**: Remove, replace, or keep original background
- **Video Quality**: Select from 720p, 1080p, 4K, or 8K output
- **Duration Control**: Set maximum video length (up to 5 minutes)

### Step 4: Generate Video
- Review all settings and click "Generate Video"
- Watch real-time progress updates
- Download your finished 4K video

## 🏗️ Architecture

### Backend Services
```
server/
├── index.js                 # Express server with Socket.IO
├── services/
│   ├── photoProcessor.js    # Image processing and face detection
│   ├── backgroundRemover.js # AI background removal/replacement
│   ├── textToSpeech.js     # Voice synthesis with 5 premium voices
│   ├── translationService.js # 40+ language translation
│   ├── lipSyncEngine.js    # Phoneme-based lip synchronization
│   ├── animationEngine.js  # Physics-based body animation
│   └── videoGenerator.js   # 4K video composition and rendering
└── uploads/                # File storage directories
```

### Frontend Components
```
client/src/
├── components/
│   ├── Layout/             # Navigation and layout components
│   ├── PhotoUpload/        # Photo upload and editing interface
│   ├── TextToSpeech/       # Voice and text input components
│   ├── VideoGeneration/    # Video generation and preview
│   ├── Gallery/            # Generated videos gallery
│   └── Settings/           # Configuration and preferences
├── context/
│   ├── AppContext.js       # Global state management
│   └── SocketContext.js    # WebSocket connection management
└── services/               # API communication services
```

## 🎨 Voice Options

### Female Voices
- **Sarah**: Warm and friendly conversational voice
- **Emma**: Professional and clear business voice
- **Sophia**: Elegant and sophisticated narrator voice
- **Mia**: Young and energetic casual voice
- **Olivia**: Calm and soothing therapeutic voice

### Male Voices
- **David**: Deep and authoritative presenter voice
- **James**: Smooth and charismatic storyteller voice
- **Michael**: Friendly and approachable casual voice
- **Alexander**: Professional and confident business voice
- **William**: Warm storytelling and educational voice

## 🌍 Supported Languages

**Most Popular**: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese (Simplified), Japanese, Korean, Arabic, Hindi

**European**: Dutch, Swedish, Danish, Norwegian, Finnish, Czech, Hungarian, Romanian, Bulgarian, Croatian, Slovak, Slovenian, Estonian, Latvian, Lithuanian, Greek, Maltese

**Asian**: Chinese (Traditional), Thai, Vietnamese, Indonesian, Malay, Tagalog, Myanmar, Khmer, Lao, Sinhala, Nepali, Mongolian

**African**: Swahili, Amharic, Hausa, Yoruba, Igbo, Zulu, Xhosa, Afrikaans, Somali, Kinyarwanda

**Middle Eastern**: Hebrew, Persian, Turkish, Kurdish

**Americas**: Haitian Creole

## ⚙️ Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Optional API Keys (for enhanced features)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
OPENAI_API_KEY=your-openai-key
REPLICATE_API_TOKEN=your-replicate-token
REMOVEBG_API_KEY=your-removebg-key

# Performance Settings
MAX_VIDEO_DURATION=300      # 5 minutes maximum
DEFAULT_VIDEO_QUALITY=4k    # Default output quality
MAX_CONCURRENT_JOBS=3       # Processing queue limit
```

### Video Quality Settings
- **720p**: 1280×720, 2Mbps video, 128k audio
- **1080p**: 1920×1080, 4Mbps video, 192k audio  
- **4K**: 3840×2160, 15Mbps video, 256k audio
- **8K**: 7680×4320, 45Mbps video, 320k audio

## 🔧 API Endpoints

### Photo Processing
```
POST /api/upload                    # Upload and process photo
POST /api/background/remove         # Remove background
POST /api/background/replace        # Replace background
```

### Text-to-Speech
```
GET  /api/tts/voices               # Get available voices
POST /api/tts/generate             # Generate speech audio
```

### Translation
```
GET  /api/translate/languages      # Get supported languages
POST /api/translate                # Translate text
```

### Video Generation
```
POST /api/lipSync/generate         # Generate lip sync data
POST /api/animation/generate       # Generate animation data
POST /api/video/generate           # Create final video
```

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test
```

### Building for Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

## 📊 Performance Optimization

### Processing Times (Approximate)
- **Photo Processing**: 2-5 seconds
- **Background Removal**: 5-10 seconds  
- **TTS Generation**: 3-8 seconds (depends on text length)
- **Lip Sync Analysis**: 10-20 seconds
- **Animation Generation**: 15-30 seconds
- **Video Rendering**: 30-120 seconds (depends on quality and length)

### System Requirements
- **Minimum**: 8GB RAM, 4-core CPU, 10GB storage
- **Recommended**: 16GB RAM, 8-core CPU, 50GB storage
- **For 4K/8K**: 32GB RAM, 12+ core CPU, 100GB storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AI Technologies**: TensorFlow, MediaPipe, OpenCV
- **Voice Synthesis**: Google Cloud TTS, custom neural networks
- **Animation**: Physics simulation engines
- **UI Framework**: React, Material-UI, Framer Motion
- **Video Processing**: FFmpeg, Sharp image processing

## 📞 Support

- **Documentation**: [Wiki Pages](https://github.com/your-username/ai-photo-animator/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/ai-photo-animator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-photo-animator/discussions)

## 🎯 Roadmap

- [ ] **v1.1**: Real-time video preview
- [ ] **v1.2**: Batch processing support
- [ ] **v1.3**: Advanced facial expressions
- [ ] **v1.4**: Custom voice training
- [ ] **v1.5**: Mobile app development
- [ ] **v2.0**: Full body animation support

---

**Made with ❤️ by the AI Photo Animator Team**

Transform your photos into magic! 🎬✨
