// AI Photo Animator - Main Application Script
class AIPhotoAnimator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.fabricCanvas = null;
        this.originalImage = null;
        this.currentImage = null;
        this.backgroundRemoved = false;
        this.audioContext = null;
        this.speechSynthesis = window.speechSynthesis;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.loadAIModels();
    }

    setupEventListeners() {
        // Photo upload
        const photoInput = document.getElementById('photoInput');
        const uploadArea = document.getElementById('uploadArea');
        
        photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processImageFile(files[0]);
            }
        });

        // Background controls
        document.getElementById('removeBgBtn').addEventListener('click', () => this.removeBackground());
        document.getElementById('replaceBgBtn').addEventListener('click', () => {
            document.getElementById('bgInput').click();
        });
        document.getElementById('bgInput').addEventListener('change', (e) => this.replaceBackground(e));

        // Photo editing controls
        document.getElementById('brightnessSlider').addEventListener('input', (e) => this.adjustBrightness(e.target.value));
        document.getElementById('contrastSlider').addEventListener('input', (e) => this.adjustContrast(e.target.value));
        document.getElementById('saturationSlider').addEventListener('input', (e) => this.adjustSaturation(e.target.value));

        // Filter buttons
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyFilter(e.target.dataset.filter));
        });

        // Animation style buttons
        document.querySelectorAll('.btn-animation').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAnimationStyle(e.target.dataset.style));
        });

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => this.generateTalkingVideo());

        // Result actions
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadVideo());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareVideo());
        document.getElementById('newProjectBtn').addEventListener('click', () => this.newProject());

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetImage());
    }

    setupCanvas() {
        this.canvas = document.getElementById('photoCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize Fabric.js canvas for advanced editing
        this.fabricCanvas = new fabric.Canvas('photoCanvas', {
            selection: true,
            preserveObjectStacking: true
        });
    }

    async loadAIModels() {
        try {
            // Load TensorFlow.js models for background removal and face detection
            console.log('Loading AI models...');
            
            // This would load actual AI models in a real implementation
            // For demo purposes, we'll simulate the loading
            await this.simulateModelLoading();
            
            console.log('AI models loaded successfully');
        } catch (error) {
            console.error('Error loading AI models:', error);
        }
    }

    async simulateModelLoading() {
        return new Promise(resolve => setTimeout(resolve, 2000));
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImageFile(file);
        }
    }

    processImageFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                this.displayImage(img);
                this.showEditor();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayImage(img) {
        // Clear canvas
        this.fabricCanvas.clear();
        
        // Calculate canvas size maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.fabricCanvas.setDimensions({ width, height });
        
        // Add image to canvas
        const fabricImg = new fabric.Image(img, {
            left: 0,
            top: 0,
            scaleX: width / img.width,
            scaleY: height / img.height,
            selectable: false
        });
        
        this.fabricCanvas.add(fabricImg);
        this.fabricCanvas.renderAll();
    }

    showEditor() {
        document.getElementById('editorSection').style.display = 'block';
        document.getElementById('editorSection').classList.add('fade-in');
    }

    async removeBackground() {
        if (!this.currentImage) return;
        
        this.showLoading();
        
        try {
            // Simulate AI background removal
            console.log('Removing background...');
            await this.simulateProcessing(3000);
            
            // In a real implementation, this would use AI models like:
            // - MediaPipe Selfie Segmentation
            // - TensorFlow.js BodyPix
            // - U2Net for background removal
            
            this.backgroundRemoved = true;
            console.log('Background removed successfully');
            
        } catch (error) {
            console.error('Error removing background:', error);
            alert('Failed to remove background. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    replaceBackground(event) {
        const file = event.target.files[0];
        if (!file || !this.backgroundRemoved) {
            alert('Please remove the background first.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const bgImg = new Image();
            bgImg.onload = () => {
                // Add background image to canvas
                const fabricBg = new fabric.Image(bgImg, {
                    left: 0,
                    top: 0,
                    scaleX: this.canvas.width / bgImg.width,
                    scaleY: this.canvas.height / bgImg.height,
                    selectable: false
                });
                
                this.fabricCanvas.insertAt(fabricBg, 0);
                this.fabricCanvas.renderAll();
            };
            bgImg.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    adjustBrightness(value) {
        this.applyImageFilter('brightness', value);
    }

    adjustContrast(value) {
        this.applyImageFilter('contrast', value);
    }

    adjustSaturation(value) {
        this.applyImageFilter('saturate', value);
    }

    applyImageFilter(filterType, value) {
        const objects = this.fabricCanvas.getObjects();
        const imageObj = objects.find(obj => obj.type === 'image');
        
        if (imageObj) {
            let filterValue;
            switch (filterType) {
                case 'brightness':
                    filterValue = (value - 100) / 100;
                    break;
                case 'contrast':
                    filterValue = value / 100;
                    break;
                case 'saturate':
                    filterValue = value / 100;
                    break;
            }
            
            imageObj.filters = imageObj.filters || [];
            imageObj.filters.push(new fabric.Image.filters[filterType.charAt(0).toUpperCase() + filterType.slice(1)]({
                [filterType]: filterValue
            }));
            
            imageObj.applyFilters();
            this.fabricCanvas.renderAll();
        }
    }

    applyFilter(filterName) {
        // Remove active class from all filter buttons
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        event.target.classList.add('active');
        
        const objects = this.fabricCanvas.getObjects();
        const imageObj = objects.find(obj => obj.type === 'image');
        
        if (imageObj) {
            // Clear existing filters
            imageObj.filters = [];
            
            switch (filterName) {
                case 'sepia':
                    imageObj.filters.push(new fabric.Image.filters.Sepia());
                    break;
                case 'grayscale':
                    imageObj.filters.push(new fabric.Image.filters.Grayscale());
                    break;
                case 'vintage':
                    imageObj.filters.push(new fabric.Image.filters.Vintage());
                    break;
                case 'none':
                default:
                    // No filters
                    break;
            }
            
            imageObj.applyFilters();
            this.fabricCanvas.renderAll();
        }
    }

    selectAnimationStyle(style) {
        // Remove active class from all animation buttons
        document.querySelectorAll('.btn-animation').forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        event.target.classList.add('active');
        
        this.animationStyle = style;
        console.log('Animation style selected:', style);
    }

    async generateTalkingVideo() {
        const speechText = document.getElementById('speechText').value.trim();
        if (!speechText) {
            alert('Please enter text for speech generation.');
            return;
        }
        
        if (!this.currentImage) {
            alert('Please upload a photo first.');
            return;
        }
        
        // Hide editor and show progress
        document.getElementById('editorSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('progressSection').classList.add('fade-in');
        
        try {
            await this.processVideoGeneration(speechText);
        } catch (error) {
            console.error('Error generating video:', error);
            alert('Failed to generate video. Please try again.');
            this.showEditor();
        }
    }

    async processVideoGeneration(text) {
        const steps = [
            { id: 'step1', name: 'Processing Photo', duration: 2000 },
            { id: 'step2', name: 'Generating Speech', duration: 3000 },
            { id: 'step3', name: 'Lip Syncing', duration: 4000 },
            { id: 'step4', name: 'Adding Movement', duration: 3000 },
            { id: 'step5', name: 'Rendering Video', duration: 5000 }
        ];
        
        let totalProgress = 0;
        const progressPerStep = 100 / steps.length;
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Activate current step
            document.getElementById(step.id).classList.add('active');
            
            // Simulate processing
            await this.simulateProcessing(step.duration);
            
            // Update progress
            totalProgress += progressPerStep;
            document.getElementById('progressFill').style.width = `${totalProgress}%`;
            
            console.log(`Completed: ${step.name}`);
        }
        
        // Generate final video
        await this.createFinalVideo(text);
        
        // Show result
        this.showResult();
    }

    async createFinalVideo(text) {
        // In a real implementation, this would:
        // 1. Use Web Audio API for speech synthesis
        // 2. Apply facial animation using MediaPipe or similar
        // 3. Generate lip-sync using AI models
        // 4. Add realistic body movements
        // 5. Render final video with proper codec
        
        console.log('Creating final video with text:', text);
        
        // For demo, create a simple video element
        const videoBlob = await this.generateDemoVideo();
        const videoURL = URL.createObjectURL(videoBlob);
        
        const resultVideo = document.getElementById('resultVideo');
        resultVideo.src = videoURL;
        
        return videoURL;
    }

    async generateDemoVideo() {
        // This would generate an actual video in a real implementation
        // For demo purposes, we'll create a simple blob
        return new Blob(['demo video content'], { type: 'video/mp4' });
    }

    showResult() {
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultSection').classList.add('fade-in');
    }

    downloadVideo() {
        const video = document.getElementById('resultVideo');
        const a = document.createElement('a');
        a.href = video.src;
        a.download = 'talking-photo-video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    async shareVideo() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Talking Photo Video',
                    text: 'Check out this amazing talking photo I created!',
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    }

    newProject() {
        // Reset everything
        this.originalImage = null;
        this.currentImage = null;
        this.backgroundRemoved = false;
        this.animationStyle = 'realistic';
        
        // Clear canvas
        if (this.fabricCanvas) {
            this.fabricCanvas.clear();
        }
        
        // Reset UI
        document.getElementById('editorSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        
        // Reset form values
        document.getElementById('speechText').value = '';
        document.getElementById('photoInput').value = '';
        document.getElementById('bgInput').value = '';
        
        // Reset sliders
        document.getElementById('brightnessSlider').value = 100;
        document.getElementById('contrastSlider').value = 100;
        document.getElementById('saturationSlider').value = 100;
        
        // Reset filter buttons
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.btn-filter[data-filter="none"]').classList.add('active');
        
        // Reset animation buttons
        document.querySelectorAll('.btn-animation').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.btn-animation[data-style="realistic"]').classList.add('active');
    }

    resetImage() {
        if (this.originalImage) {
            this.currentImage = this.originalImage;
            this.displayImage(this.originalImage);
            this.backgroundRemoved = false;
            
            // Reset sliders
            document.getElementById('brightnessSlider').value = 100;
            document.getElementById('contrastSlider').value = 100;
            document.getElementById('saturationSlider').value = 100;
            
            // Reset filter buttons
            document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.btn-filter[data-filter="none"]').classList.add('active');
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    async simulateProcessing(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }
}

// Additional AI Features Class
class AIFeatures {
    constructor() {
        this.voices = this.loadVoices();
        this.languages = this.loadLanguages();
    }

    loadVoices() {
        return {
            'female-1': { name: 'Sarah', gender: 'female', language: 'en', pitch: 1.2, rate: 1.0 },
            'female-2': { name: 'Emma', gender: 'female', language: 'en', pitch: 1.1, rate: 0.9 },
            'female-3': { name: 'Sophia', gender: 'female', language: 'en', pitch: 1.3, rate: 1.1 },
            'male-1': { name: 'David', gender: 'male', language: 'en', pitch: 0.8, rate: 1.0 },
            'male-2': { name: 'James', gender: 'male', language: 'en', pitch: 0.7, rate: 0.95 }
        };
    }

    loadLanguages() {
        return {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
            'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
            'ar': 'Arabic', 'hi': 'Hindi', 'bn': 'Bengali', 'ur': 'Urdu', 'tr': 'Turkish',
            'pl': 'Polish', 'nl': 'Dutch', 'sv': 'Swedish', 'da': 'Danish', 'no': 'Norwegian',
            'fi': 'Finnish', 'el': 'Greek', 'he': 'Hebrew', 'th': 'Thai', 'vi': 'Vietnamese',
            'id': 'Indonesian', 'ms': 'Malay', 'tl': 'Filipino', 'sw': 'Swahili', 'am': 'Amharic',
            'zu': 'Zulu', 'xh': 'Xhosa', 'af': 'Afrikaans', 'sq': 'Albanian', 'az': 'Azerbaijani',
            'eu': 'Basque', 'be': 'Belarusian', 'bg': 'Bulgarian', 'ca': 'Catalan', 'hr': 'Croatian',
            'cs': 'Czech', 'et': 'Estonian', 'ka': 'Georgian'
        };
    }

    async translateText(text, targetLanguage) {
        // In a real implementation, this would use Google Translate API or similar
        console.log(`Translating "${text}" to ${targetLanguage}`);
        return text; // Placeholder
    }

    async generateSpeech(text, voiceId, language) {
        const voice = this.voices[voiceId];
        if (!voice) return null;
        
        // Use Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.pitch = voice.pitch;
        utterance.rate = voice.rate;
        
        return new Promise((resolve) => {
            utterance.onend = () => resolve(true);
            speechSynthesis.speak(utterance);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiPhotoAnimator = new AIPhotoAnimator();
    window.aiFeatures = new AIFeatures();
    
    console.log('AI Photo Animator initialized successfully!');
});