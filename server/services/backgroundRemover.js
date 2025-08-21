const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class BackgroundRemover {
  constructor() {
    this.processedDir = path.join(__dirname, '..', 'processed');
    this.backgroundsDir = path.join(__dirname, '..', 'backgrounds');
    this.ensureDirectoryExists(this.processedDir);
    this.ensureDirectoryExists(this.backgroundsDir);
    
    // Pre-defined background options
    this.backgroundTypes = {
      studio: ['white', 'black', 'gray', 'blue', 'green'],
      nature: ['forest', 'beach', 'mountains', 'sunset', 'sky'],
      urban: ['city', 'office', 'street', 'building', 'cafe'],
      abstract: ['gradient', 'bokeh', 'geometric', 'artistic', 'minimal']
    };
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async removeBackground(imagePath, progressCallback) {
    try {
      progressCallback && progressCallback(10);

      // In a production environment, you would use:
      // 1. Remove.bg API
      // 2. U2Net model
      // 3. Segment Anything Model (SAM)
      // 4. MediaPipe Selfie Segmentation
      
      // For this demo, we'll simulate background removal with edge detection and masking
      const removedBgFilename = `bg_removed_${Date.now()}_${uuidv4()}.png`;
      const removedBgPath = path.join(this.processedDir, removedBgFilename);

      progressCallback && progressCallback(30);

      // Load and analyze the image
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      progressCallback && progressCallback(50);

      // Simulate AI background removal
      // In reality, this would involve complex ML models
      const processedImage = await this.simulateBackgroundRemoval(image, metadata);

      progressCallback && progressCallback(80);

      // Save the result as PNG with transparency
      await processedImage
        .png({ compressionLevel: 6 })
        .toFile(removedBgPath);

      progressCallback && progressCallback(100);

      return {
        processedImagePath: removedBgPath,
        filename: removedBgFilename,
        hasTransparency: true,
        originalDimensions: {
          width: metadata.width,
          height: metadata.height
        }
      };
    } catch (error) {
      console.error('Background removal error:', error);
      throw new Error(`Failed to remove background: ${error.message}`);
    }
  }

  async simulateBackgroundRemoval(image, metadata) {
    try {
      // Create a simple mask based on edge detection and center focus
      // This is a simplified approach - real AI would use semantic segmentation
      
      // Create a radial gradient mask (assuming subject is in center)
      const centerX = Math.floor(metadata.width / 2);
      const centerY = Math.floor(metadata.height / 2);
      const maxRadius = Math.min(metadata.width, metadata.height) * 0.4;

      // Generate mask buffer
      const maskBuffer = Buffer.alloc(metadata.width * metadata.height);
      
      for (let y = 0; y < metadata.height; y++) {
        for (let x = 0; x < metadata.width; x++) {
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          
          // Create smooth falloff from center
          let alpha = 255;
          if (distance > maxRadius) {
            const falloff = (distance - maxRadius) / (maxRadius * 0.5);
            alpha = Math.max(0, 255 - (falloff * 255));
          }
          
          maskBuffer[y * metadata.width + x] = Math.floor(alpha);
        }
      }

      // Create mask image
      const mask = sharp(maskBuffer, {
        raw: {
          width: metadata.width,
          height: metadata.height,
          channels: 1
        }
      }).png();

      // Apply mask to original image
      const originalBuffer = await image.png().toBuffer();
      
      return sharp(originalBuffer)
        .composite([{
          input: await mask.toBuffer(),
          blend: 'dest-in'
        }]);
        
    } catch (error) {
      console.error('Background removal simulation error:', error);
      throw error;
    }
  }

  async replaceBackground(imagePath, backgroundType, customBackground) {
    try {
      // First remove the background
      const removedBg = await this.removeBackground(imagePath, null);
      
      // Generate or load the new background
      const backgroundImage = await this.generateBackground(
        backgroundType, 
        customBackground,
        removedBg.originalDimensions
      );

      const finalFilename = `bg_replaced_${Date.now()}_${uuidv4()}.jpg`;
      const finalPath = path.join(this.processedDir, finalFilename);

      // Composite the subject onto the new background
      await sharp(backgroundImage)
        .composite([{
          input: removedBg.processedImagePath,
          blend: 'over'
        }])
        .jpeg({ quality: 90 })
        .toFile(finalPath);

      // Clean up temporary file
      fs.unlinkSync(removedBg.processedImagePath);

      return {
        processedImagePath: finalPath,
        filename: finalFilename,
        backgroundType,
        dimensions: removedBg.originalDimensions
      };
    } catch (error) {
      console.error('Background replacement error:', error);
      throw new Error(`Failed to replace background: ${error.message}`);
    }
  }

  async generateBackground(backgroundType, customBackground, dimensions) {
    try {
      const { width, height } = dimensions;

      if (customBackground) {
        // Use custom background image
        return await sharp(customBackground)
          .resize(width, height, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();
      }

      // Generate procedural background based on type
      switch (backgroundType) {
        case 'white':
          return await sharp({
            create: {
              width,
              height,
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          }).jpeg().toBuffer();

        case 'black':
          return await sharp({
            create: {
              width,
              height,
              channels: 3,
              background: { r: 0, g: 0, b: 0 }
            }
          }).jpeg().toBuffer();

        case 'gray':
          return await sharp({
            create: {
              width,
              height,
              channels: 3,
              background: { r: 128, g: 128, b: 128 }
            }
          }).jpeg().toBuffer();

        case 'blue':
          return await this.generateGradientBackground(width, height, 
            { r: 70, g: 130, b: 255 }, { r: 30, g: 90, b: 200 });

        case 'green':
          return await this.generateGradientBackground(width, height,
            { r: 50, g: 200, b: 100 }, { r: 30, g: 150, b: 80 });

        case 'gradient':
          return await this.generateGradientBackground(width, height,
            { r: 255, g: 100, b: 150 }, { r: 100, g: 150, b: 255 });

        case 'bokeh':
          return await this.generateBokehBackground(width, height);

        default:
          // Default to white background
          return await sharp({
            create: {
              width,
              height,
              channels: 3,
              background: { r: 255, g: 255, b: 255 }
            }
          }).jpeg().toBuffer();
      }
    } catch (error) {
      console.error('Background generation error:', error);
      throw error;
    }
  }

  async generateGradientBackground(width, height, color1, color2) {
    try {
      // Create SVG gradient
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:rgb(${color1.r},${color1.g},${color1.b});stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgb(${color2.r},${color2.g},${color2.b});stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" />
        </svg>
      `;

      return await sharp(Buffer.from(svg))
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error) {
      console.error('Gradient generation error:', error);
      throw error;
    }
  }

  async generateBokehBackground(width, height) {
    try {
      // Create a bokeh effect with multiple circles
      const circles = [];
      const numCircles = 20;

      for (let i = 0; i < numCircles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 100 + 20;
        const opacity = Math.random() * 0.3 + 0.1;
        const hue = Math.random() * 360;
        
        circles.push({
          x: x - radius,
          y: y - radius,
          radius: radius * 2,
          opacity,
          hue
        });
      }

      // Generate SVG with bokeh circles
      const circleElements = circles.map(circle => 
        `<circle cx="${circle.radius/2}" cy="${circle.radius/2}" r="${circle.radius/3}" 
         fill="hsl(${circle.hue}, 70%, 60%)" opacity="${circle.opacity}" 
         transform="translate(${circle.x}, ${circle.y})" />`
      ).join('');

      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur">
              <feGaussianBlur stdDeviation="3"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#1a1a2e"/>
          <g filter="url(#blur)">
            ${circleElements}
          </g>
        </svg>
      `;

      return await sharp(Buffer.from(svg))
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error) {
      console.error('Bokeh generation error:', error);
      throw error;
    }
  }

  async downloadBackgroundImage(url, dimensions) {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
      });

      const filename = `bg_download_${Date.now()}_${uuidv4()}.jpg`;
      const filepath = path.join(this.backgroundsDir, filename);

      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', async () => {
          try {
            // Resize to match dimensions
            const resizedBuffer = await sharp(filepath)
              .resize(dimensions.width, dimensions.height, { fit: 'cover' })
              .jpeg({ quality: 90 })
              .toBuffer();

            resolve(resizedBuffer);
          } catch (error) {
            reject(error);
          }
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Background download error:', error);
      throw error;
    }
  }

  getAvailableBackgrounds() {
    return {
      types: this.backgroundTypes,
      customUpload: true,
      urlDownload: true
    };
  }
}

module.exports = new BackgroundRemover();