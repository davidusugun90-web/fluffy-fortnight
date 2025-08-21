const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class PhotoProcessor {
  constructor() {
    this.processedDir = path.join(__dirname, '..', 'processed');
    this.ensureDirectoryExists(this.processedDir);
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async processPhoto(photoData) {
    try {
      const { path: originalPath, filename } = photoData;
      
      // Generate processed filename
      const processedFilename = `processed_${filename}`;
      const processedPath = path.join(this.processedDir, processedFilename);

      // Get image metadata
      const metadata = await sharp(originalPath).metadata();
      
      // Basic image processing and optimization
      const processedImage = await sharp(originalPath)
        .resize({ 
          width: Math.min(metadata.width, 2048), 
          height: Math.min(metadata.height, 2048),
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90, progressive: true })
        .toFile(processedPath);

      // Analyze image for face detection
      const faceAnalysis = await this.detectFaces(originalPath);
      
      // Extract color palette
      const colorPalette = await this.extractColorPalette(originalPath);

      return {
        ...photoData,
        processedPath,
        processedFilename,
        metadata: {
          width: processedImage.width,
          height: processedImage.height,
          channels: processedImage.channels,
          format: 'jpeg',
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          originalFormat: metadata.format
        },
        faceAnalysis,
        colorPalette,
        processedAt: new Date()
      };
    } catch (error) {
      console.error('Photo processing error:', error);
      throw new Error(`Failed to process photo: ${error.message}`);
    }
  }

  async detectFaces(imagePath) {
    try {
      // This is a simplified face detection
      // In production, you'd use TensorFlow.js, face-api.js, or cloud APIs
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Mock face detection data - replace with actual AI face detection
      const mockFaceData = {
        facesDetected: 1, // Assume 1 face for demo
        faces: [{
          id: uuidv4(),
          boundingBox: {
            x: Math.floor(metadata.width * 0.25),
            y: Math.floor(metadata.height * 0.15),
            width: Math.floor(metadata.width * 0.5),
            height: Math.floor(metadata.height * 0.7)
          },
          landmarks: {
            leftEye: { x: metadata.width * 0.35, y: metadata.height * 0.35 },
            rightEye: { x: metadata.width * 0.65, y: metadata.height * 0.35 },
            nose: { x: metadata.width * 0.5, y: metadata.height * 0.5 },
            mouth: { x: metadata.width * 0.5, y: metadata.height * 0.7 },
            leftEar: { x: metadata.width * 0.25, y: metadata.height * 0.4 },
            rightEar: { x: metadata.width * 0.75, y: metadata.height * 0.4 }
          },
          confidence: 0.95,
          emotions: {
            neutral: 0.7,
            happy: 0.2,
            sad: 0.05,
            angry: 0.03,
            surprised: 0.02
          }
        }]
      };

      return mockFaceData;
    } catch (error) {
      console.error('Face detection error:', error);
      return { facesDetected: 0, faces: [] };
    }
  }

  async extractColorPalette(imagePath) {
    try {
      const image = sharp(imagePath);
      const { data, info } = await image
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Simple color extraction algorithm
      const colorCounts = {};
      const pixelCount = info.width * info.height;

      for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Quantize colors to reduce palette size
        const quantizedR = Math.floor(r / 32) * 32;
        const quantizedG = Math.floor(g / 32) * 32;
        const quantizedB = Math.floor(b / 32) * 32;
        
        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
        colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
      }

      // Get top 5 colors
      const sortedColors = Object.entries(colorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([color, count]) => {
          const [r, g, b] = color.split(',').map(Number);
          return {
            rgb: { r, g, b },
            hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
            percentage: Math.round((count / pixelCount) * 100 * 100) / 100
          };
        });

      return {
        dominantColors: sortedColors,
        extractedAt: new Date()
      };
    } catch (error) {
      console.error('Color extraction error:', error);
      return { dominantColors: [] };
    }
  }

  async cropImage(imagePath, cropData) {
    try {
      const { x, y, width, height } = cropData;
      const croppedFilename = `cropped_${Date.now()}_${uuidv4()}.jpg`;
      const croppedPath = path.join(this.processedDir, croppedFilename);

      await sharp(imagePath)
        .extract({ left: Math.floor(x), top: Math.floor(y), width: Math.floor(width), height: Math.floor(height) })
        .jpeg({ quality: 90 })
        .toFile(croppedPath);

      return {
        croppedPath,
        croppedFilename
      };
    } catch (error) {
      console.error('Image cropping error:', error);
      throw new Error(`Failed to crop image: ${error.message}`);
    }
  }

  async resizeImage(imagePath, dimensions) {
    try {
      const { width, height } = dimensions;
      const resizedFilename = `resized_${Date.now()}_${uuidv4()}.jpg`;
      const resizedPath = path.join(this.processedDir, resizedFilename);

      await sharp(imagePath)
        .resize(width, height, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toFile(resizedPath);

      return {
        resizedPath,
        resizedFilename
      };
    } catch (error) {
      console.error('Image resizing error:', error);
      throw new Error(`Failed to resize image: ${error.message}`);
    }
  }

  async adjustBrightness(imagePath, brightness) {
    try {
      const adjustedFilename = `brightness_${Date.now()}_${uuidv4()}.jpg`;
      const adjustedPath = path.join(this.processedDir, adjustedFilename);

      await sharp(imagePath)
        .modulate({ brightness: brightness / 100 + 1 })
        .jpeg({ quality: 90 })
        .toFile(adjustedPath);

      return {
        adjustedPath,
        adjustedFilename
      };
    } catch (error) {
      console.error('Brightness adjustment error:', error);
      throw new Error(`Failed to adjust brightness: ${error.message}`);
    }
  }

  async adjustContrast(imagePath, contrast) {
    try {
      const adjustedFilename = `contrast_${Date.now()}_${uuidv4()}.jpg`;
      const adjustedPath = path.join(this.processedDir, adjustedFilename);

      // Sharp doesn't have direct contrast, so we use linear transformation
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      
      await sharp(imagePath)
        .linear(factor, -(128 * factor) + 128)
        .jpeg({ quality: 90 })
        .toFile(adjustedPath);

      return {
        adjustedPath,
        adjustedFilename
      };
    } catch (error) {
      console.error('Contrast adjustment error:', error);
      throw new Error(`Failed to adjust contrast: ${error.message}`);
    }
  }

  async applyFilter(imagePath, filterType) {
    try {
      const filteredFilename = `filtered_${filterType}_${Date.now()}_${uuidv4()}.jpg`;
      const filteredPath = path.join(this.processedDir, filteredFilename);

      let imageProcessor = sharp(imagePath);

      switch (filterType) {
        case 'grayscale':
          imageProcessor = imageProcessor.grayscale();
          break;
        case 'sepia':
          imageProcessor = imageProcessor.tint({ r: 255, g: 240, b: 196 });
          break;
        case 'blur':
          imageProcessor = imageProcessor.blur(3);
          break;
        case 'sharpen':
          imageProcessor = imageProcessor.sharpen();
          break;
        case 'vintage':
          imageProcessor = imageProcessor
            .modulate({ brightness: 0.9, saturation: 0.8 })
            .tint({ r: 255, g: 240, b: 200 });
          break;
        default:
          break;
      }

      await imageProcessor
        .jpeg({ quality: 90 })
        .toFile(filteredPath);

      return {
        filteredPath,
        filteredFilename,
        filterType
      };
    } catch (error) {
      console.error('Filter application error:', error);
      throw new Error(`Failed to apply filter: ${error.message}`);
    }
  }

  async enhanceImage(imagePath) {
    try {
      const enhancedFilename = `enhanced_${Date.now()}_${uuidv4()}.jpg`;
      const enhancedPath = path.join(this.processedDir, enhancedFilename);

      await sharp(imagePath)
        .normalize() // Auto-adjust contrast
        .modulate({ 
          brightness: 1.05, // Slight brightness boost
          saturation: 1.1   // Slight saturation boost
        })
        .sharpen({ sigma: 1, m1: 0.5, m2: 2 })
        .jpeg({ quality: 92 })
        .toFile(enhancedPath);

      return {
        enhancedPath,
        enhancedFilename
      };
    } catch (error) {
      console.error('Image enhancement error:', error);
      throw new Error(`Failed to enhance image: ${error.message}`);
    }
  }
}

module.exports = new PhotoProcessor();