#!/bin/bash

# AI Photo Animator Startup Script
echo "🚀 Starting AI Photo Animator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. Installing FFmpeg..."
    
    # Try to install FFmpeg based on the system
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y ffmpeg
    elif command -v yum &> /dev/null; then
        sudo yum install -y ffmpeg
    elif command -v brew &> /dev/null; then
        brew install ffmpeg
    else
        echo "❌ Could not install FFmpeg automatically. Please install it manually."
        echo "   Ubuntu/Debian: sudo apt-get install ffmpeg"
        echo "   CentOS/RHEL: sudo yum install ffmpeg"
        echo "   macOS: brew install ffmpeg"
        exit 1
    fi
fi

# Create logs directory
mkdir -p server/logs

# Check if environment file exists
if [ ! -f "server/.env" ]; then
    echo "📝 Creating environment file..."
    cp server/.env.example server/.env
    echo "✅ Environment file created. Please edit server/.env with your API keys if needed."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
fi

# Check if build is needed for production
if [ "$NODE_ENV" = "production" ]; then
    echo "🏗️  Building for production..."
    npm run build
fi

# Start the application
echo "🎬 Starting AI Photo Animator..."
echo "📸 Photo processing: ✅"
echo "🎤 Enhanced TTS (ElevenLabs): $([ -n "$ELEVENLABS_API_KEY" ] && echo "✅" || echo "⚠️  Not configured")"
echo "🖼️  AI Background (Stability AI): $([ -n "$STABILITY_AI_API_KEY" ] && echo "✅" || echo "⚠️  Not configured")"
echo "🌍 Translation: ✅"
echo "👄 Lip Sync: ✅"
echo "🎭 Animation: ✅"
echo "🎬 4K Video Generation: ✅"

echo ""
echo "🌐 Starting servers..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""

# Start the application
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi