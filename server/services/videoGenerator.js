const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

class VideoGenerator {
  constructor() {
    this.videosDir = path.join(__dirname, '..', 'videos');
    this.tempDir = path.join(__dirname, '..', 'temp');
    this.framesDir = path.join(__dirname, '..', 'frames');
    
    this.ensureDirectoryExists(this.videosDir);
    this.ensureDirectoryExists(this.tempDir);
    this.ensureDirectoryExists(this.framesDir);

    // Video quality presets
    this.qualityPresets = {
      '720p': {
        width: 1280,
        height: 720,
        bitrate: '2000k',
        audioBitrate: '128k',
        fps: 30,
        name: 'HD 720p'
      },
      '1080p': {
        width: 1920,
        height: 1080,
        bitrate: '4000k',
        audioBitrate: '192k',
        fps: 30,
        name: 'Full HD 1080p'
      },
      '4k': {
        width: 3840,
        height: 2160,
        bitrate: '15000k',
        audioBitrate: '256k',
        fps: 30,
        name: 'Ultra HD 4K'
      },
      '8k': {
        width: 7680,
        height: 4320,
        bitrate: '45000k',
        audioBitrate: '320k',
        fps: 30,
        name: 'Ultra HD 8K'
      }
    };

    // Video codecs and formats
    this.videoCodecs = {
      h264: { codec: 'libx264', profile: 'high', level: '4.0' },
      h265: { codec: 'libx265', profile: 'main', crf: 23 },
      vp9: { codec: 'libvpx-vp9', crf: 30 },
      av1: { codec: 'libaom-av1', crf: 30 }
    };

    // Audio codecs
    this.audioCodecs = {
      aac: 'aac',
      mp3: 'mp3',
      opus: 'libopus',
      flac: 'flac'
    };

    // Animation interpolation settings
    this.interpolationSettings = {
      frameRate: 30,
      motionBlur: true,
      antiAliasing: true,
      colorAccuracy: 'rec2020', // For 4K+ content
      hdr: false // Can be enabled for HDR content
    };
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async generateVideo(options, progressCallback) {
    try {
      const {
        photoPath,
        audioFile,
        lipSyncData,
        animationData,
        backgroundData,
        quality = '4k',
        maxDuration = 300, // 5 minutes
        sessionId
      } = options;

      progressCallback && progressCallback(0, 'Initializing video generation...');

      // Validate and prepare inputs
      const videoConfig = this.prepareVideoConfiguration(quality, maxDuration);
      progressCallback && progressCallback(5, 'Video configuration prepared');

      // Generate frame sequence
      const frameSequence = await this.generateFrameSequence(
        photoPath,
        lipSyncData,
        animationData,
        backgroundData,
        videoConfig
      );
      progressCallback && progressCallback(30, 'Frame sequence generated');

      // Render individual frames
      const renderedFrames = await this.renderFrames(
        frameSequence,
        videoConfig,
        (frameProgress) => {
          const totalProgress = 30 + (frameProgress * 0.4);
          progressCallback && progressCallback(totalProgress, 'Rendering frames...');
        }
      );
      progressCallback && progressCallback(70, 'Frame rendering complete');

      // Process audio
      const processedAudio = await this.processAudio(
        audioFile,
        videoConfig,
        frameSequence.duration
      );
      progressCallback && progressCallback(80, 'Audio processing complete');

      // Combine frames and audio into final video
      const finalVideo = await this.combineVideoAndAudio(
        renderedFrames,
        processedAudio,
        videoConfig,
        (combineProgress) => {
          const totalProgress = 80 + (combineProgress * 0.15);
          progressCallback && progressCallback(totalProgress, 'Combining video and audio...');
        }
      );
      progressCallback && progressCallback(95, 'Video combination complete');

      // Apply final post-processing
      const postProcessedVideo = await this.applyPostProcessing(
        finalVideo,
        videoConfig
      );
      progressCallback && progressCallback(100, 'Video generation complete');

      // Clean up temporary files
      await this.cleanupTempFiles(renderedFrames.tempFiles);

      return {
        videoFile: postProcessedVideo.outputPath,
        duration: frameSequence.duration,
        quality: videoConfig.quality.name,
        fileSize: postProcessedVideo.fileSize,
        metadata: {
          width: videoConfig.quality.width,
          height: videoConfig.quality.height,
          fps: videoConfig.quality.fps,
          bitrate: videoConfig.quality.bitrate,
          audioCodec: videoConfig.audioCodec,
          videoCodec: videoConfig.videoCodec,
          totalFrames: frameSequence.totalFrames
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  prepareVideoConfiguration(quality, maxDuration) {
    const qualityPreset = this.qualityPresets[quality] || this.qualityPresets['4k'];
    
    return {
      quality: qualityPreset,
      maxDuration,
      videoCodec: this.videoCodecs.h264, // Most compatible
      audioCodec: this.audioCodecs.aac,
      format: 'mp4',
      frameRate: qualityPreset.fps,
      interpolation: this.interpolationSettings,
      outputFilename: `video_${uuidv4()}_${quality}.mp4`
    };
  }

  async generateFrameSequence(photoPath, lipSyncData, animationData, backgroundData, videoConfig) {
    try {
      // Determine video duration (use audio duration or animation duration)
      const audioDuration = lipSyncData?.duration || 0;
      const animationDuration = animationData?.duration || 0;
      const duration = Math.min(
        Math.max(audioDuration, animationDuration, 1), // At least 1 second
        videoConfig.maxDuration
      );

      const totalFrames = Math.ceil(duration * videoConfig.frameRate);
      const frameSequence = [];

      // Load base image
      const baseImage = sharp(photoPath);
      const baseImageInfo = await baseImage.metadata();

      for (let frame = 0; frame < totalFrames; frame++) {
        const time = frame / videoConfig.frameRate;
        
        // Get lip sync data for this frame
        const lipSyncFrame = this.getLipSyncDataAtTime(lipSyncData, time);
        
        // Get animation data for this frame
        const animationFrame = this.getAnimationDataAtTime(animationData, time);
        
        // Get background data
        const backgroundFrame = this.getBackgroundDataAtTime(backgroundData, time);

        frameSequence.push({
          frameNumber: frame,
          time: time,
          baseImage: {
            path: photoPath,
            metadata: baseImageInfo
          },
          lipSync: lipSyncFrame,
          animation: animationFrame,
          background: backgroundFrame,
          outputPath: path.join(this.framesDir, `frame_${frame.toString().padStart(6, '0')}.png`)
        });
      }

      return {
        frames: frameSequence,
        duration: duration,
        totalFrames: totalFrames,
        frameRate: videoConfig.frameRate
      };
    } catch (error) {
      console.error('Frame sequence generation error:', error);
      throw error;
    }
  }

  getLipSyncDataAtTime(lipSyncData, time) {
    if (!lipSyncData || !lipSyncData.facialAnimation) return null;

    // Find the closest keyframe
    const keyframes = lipSyncData.facialAnimation.keyframes;
    let closestFrame = keyframes[0];
    let minTimeDiff = Math.abs(keyframes[0].time - time);

    for (const keyframe of keyframes) {
      const timeDiff = Math.abs(keyframe.time - time);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestFrame = keyframe;
      }
    }

    return closestFrame;
  }

  getAnimationDataAtTime(animationData, time) {
    if (!animationData || !animationData.animationKeyframes) return null;

    // Find the closest keyframe
    const keyframes = animationData.animationKeyframes.keyframes;
    let closestFrame = keyframes[0];
    let minTimeDiff = Math.abs(keyframes[0].time - time);

    for (const keyframe of keyframes) {
      const timeDiff = Math.abs(keyframe.time - time);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestFrame = keyframe;
      }
    }

    return closestFrame;
  }

  getBackgroundDataAtTime(backgroundData, time) {
    // For static backgrounds, return the same data
    // For animated backgrounds, this would interpolate
    return backgroundData;
  }

  async renderFrames(frameSequence, videoConfig, progressCallback) {
    const renderedFrames = [];
    const tempFiles = [];
    
    for (let i = 0; i < frameSequence.frames.length; i++) {
      const frameData = frameSequence.frames[i];
      
      try {
        const renderedFrame = await this.renderSingleFrame(frameData, videoConfig);
        renderedFrames.push(renderedFrame);
        tempFiles.push(renderedFrame.outputPath);
        
        // Report progress
        const progress = ((i + 1) / frameSequence.frames.length) * 100;
        progressCallback && progressCallback(progress);
      } catch (error) {
        console.error(`Error rendering frame ${i}:`, error);
        // Create a fallback frame
        const fallbackFrame = await this.createFallbackFrame(frameData, videoConfig);
        renderedFrames.push(fallbackFrame);
        tempFiles.push(fallbackFrame.outputPath);
      }
    }

    return {
      frames: renderedFrames,
      tempFiles: tempFiles,
      totalFrames: renderedFrames.length
    };
  }

  async renderSingleFrame(frameData, videoConfig) {
    try {
      // Start with base image
      let frameImage = sharp(frameData.baseImage.path);
      const targetWidth = videoConfig.quality.width;
      const targetHeight = videoConfig.quality.height;

      // Apply background if provided
      if (frameData.background) {
        frameImage = await this.applyBackground(frameImage, frameData.background, targetWidth, targetHeight);
      }

      // Apply body animation transformations
      if (frameData.animation) {
        frameImage = await this.applyAnimationTransforms(frameImage, frameData.animation);
      }

      // Apply lip sync transformations
      if (frameData.lipSync) {
        frameImage = await this.applyLipSyncTransforms(frameImage, frameData.lipSync);
      }

      // Resize to target resolution with high quality
      frameImage = frameImage
        .resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'center'
        })
        .png({ 
          compressionLevel: 6,
          quality: 95
        });

      // Save the frame
      await frameImage.toFile(frameData.outputPath);

      return {
        frameNumber: frameData.frameNumber,
        outputPath: frameData.outputPath,
        time: frameData.time
      };
    } catch (error) {
      console.error('Single frame rendering error:', error);
      throw error;
    }
  }

  async applyBackground(frameImage, backgroundData, width, height) {
    if (!backgroundData || !backgroundData.processedImagePath) {
      return frameImage;
    }

    try {
      // Load background and resize to target dimensions
      const background = sharp(backgroundData.processedImagePath)
        .resize(width, height, { fit: 'cover' });

      // Composite the frame over the background
      const backgroundBuffer = await background.png().toBuffer();
      const frameBuffer = await frameImage.png().toBuffer();

      return sharp(backgroundBuffer)
        .composite([{
          input: frameBuffer,
          blend: 'over'
        }]);
    } catch (error) {
      console.error('Background application error:', error);
      return frameImage;
    }
  }

  async applyAnimationTransforms(frameImage, animationFrame) {
    if (!animationFrame || !animationFrame.transformations) {
      return frameImage;
    }

    try {
      // For now, apply simple transformations
      // In production, this would use more sophisticated image warping
      
      const transformations = animationFrame.transformations;
      let transformedImage = frameImage;

      // Apply global transformations (simplified)
      if (transformations.head) {
        const headTransform = transformations.head;
        if (headTransform.translation) {
          // Apply translation (this is simplified - real implementation would use affine transforms)
          const offsetX = Math.round(headTransform.translation.x);
          const offsetY = Math.round(headTransform.translation.y);
          
          if (offsetX !== 0 || offsetY !== 0) {
            const { width, height } = await transformedImage.metadata();
            transformedImage = transformedImage
              .extend({
                top: Math.max(0, -offsetY),
                bottom: Math.max(0, offsetY),
                left: Math.max(0, -offsetX),
                right: Math.max(0, offsetX),
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              })
              .extract({
                left: Math.max(0, offsetX),
                top: Math.max(0, offsetY),
                width: width,
                height: height
              });
          }
        }
      }

      return transformedImage;
    } catch (error) {
      console.error('Animation transform error:', error);
      return frameImage;
    }
  }

  async applyLipSyncTransforms(frameImage, lipSyncFrame) {
    if (!lipSyncFrame || !lipSyncFrame.mouthTransform) {
      return frameImage;
    }

    try {
      // Apply mouth transformations (simplified)
      // In production, this would use facial landmark warping
      
      const mouthTransform = lipSyncFrame.mouthTransform;
      let transformedImage = frameImage;

      // Apply subtle mouth area transformations
      if (mouthTransform.intensity > 0.1) {
        // This is a placeholder for actual facial morphing
        // Real implementation would use libraries like OpenCV or custom mesh deformation
        transformedImage = frameImage.modulate({
          brightness: 1 + (mouthTransform.intensity * 0.05),
          saturation: 1 + (mouthTransform.intensity * 0.1)
        });
      }

      return transformedImage;
    } catch (error) {
      console.error('Lip sync transform error:', error);
      return frameImage;
    }
  }

  async createFallbackFrame(frameData, videoConfig) {
    // Create a simple fallback frame using the base image
    try {
      const fallbackImage = sharp(frameData.baseImage.path)
        .resize(videoConfig.quality.width, videoConfig.quality.height, {
          fit: 'cover',
          position: 'center'
        })
        .png();

      await fallbackImage.toFile(frameData.outputPath);

      return {
        frameNumber: frameData.frameNumber,
        outputPath: frameData.outputPath,
        time: frameData.time,
        isFallback: true
      };
    } catch (error) {
      console.error('Fallback frame creation error:', error);
      throw error;
    }
  }

  async processAudio(audioFile, videoConfig, videoDuration) {
    if (!audioFile || !fs.existsSync(audioFile)) {
      // Generate silent audio track
      return this.generateSilentAudio(videoDuration, videoConfig);
    }

    try {
      const processedAudioPath = path.join(this.tempDir, `processed_audio_${uuidv4()}.aac`);

      return new Promise((resolve, reject) => {
        ffmpeg(audioFile)
          .audioCodec(videoConfig.audioCodec.aac)
          .audioBitrate(videoConfig.quality.audioBitrate)
          .audioFrequency(48000)
          .audioChannels(2)
          .duration(videoDuration)
          .output(processedAudioPath)
          .on('end', () => {
            resolve({
              audioPath: processedAudioPath,
              duration: videoDuration,
              isProcessed: true
            });
          })
          .on('error', (error) => {
            console.error('Audio processing error:', error);
            reject(error);
          })
          .run();
      });
    } catch (error) {
      console.error('Audio processing error:', error);
      // Return silent audio as fallback
      return this.generateSilentAudio(videoDuration, videoConfig);
    }
  }

  async generateSilentAudio(duration, videoConfig) {
    const silentAudioPath = path.join(this.tempDir, `silent_audio_${uuidv4()}.aac`);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input('anullsrc=channel_layout=stereo:sample_rate=48000')
        .inputFormat('lavfi')
        .audioCodec(videoConfig.audioCodec.aac)
        .audioBitrate(videoConfig.quality.audioBitrate)
        .duration(duration)
        .output(silentAudioPath)
        .on('end', () => {
          resolve({
            audioPath: silentAudioPath,
            duration: duration,
            isSilent: true
          });
        })
        .on('error', reject)
        .run();
    });
  }

  async combineVideoAndAudio(renderedFrames, processedAudio, videoConfig, progressCallback) {
    const outputPath = path.join(this.videosDir, videoConfig.outputFilename);
    const framePattern = path.join(this.framesDir, 'frame_%06d.png');

    return new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg()
        .input(framePattern)
        .inputFPS(videoConfig.frameRate)
        .input(processedAudio.audioPath)
        .videoCodec(videoConfig.videoCodec.codec)
        .videoBitrate(videoConfig.quality.bitrate)
        .audioCodec(videoConfig.audioCodec)
        .audioBitrate(videoConfig.quality.audioBitrate)
        .fps(videoConfig.frameRate)
        .size(`${videoConfig.quality.width}x${videoConfig.quality.height}`)
        .aspect('16:9')
        .output(outputPath);

      // Add codec-specific options
      if (videoConfig.videoCodec.codec === 'libx264') {
        ffmpegCommand = ffmpegCommand
          .addOption('-profile:v', videoConfig.videoCodec.profile)
          .addOption('-level:v', videoConfig.videoCodec.level)
          .addOption('-preset', 'medium')
          .addOption('-crf', '23');
      }

      // Add format-specific options
      if (videoConfig.format === 'mp4') {
        ffmpegCommand = ffmpegCommand
          .addOption('-movflags', '+faststart')
          .addOption('-pix_fmt', 'yuv420p');
      }

      // Add color space options for 4K+
      if (videoConfig.quality.width >= 3840) {
        ffmpegCommand = ffmpegCommand
          .addOption('-colorspace', 'bt2020nc')
          .addOption('-color_primaries', 'bt2020')
          .addOption('-color_trc', 'smpte2084');
      }

      ffmpegCommand
        .on('progress', (progress) => {
          if (progressCallback) {
            progressCallback(progress.percent || 0);
          }
        })
        .on('end', () => {
          resolve({
            outputPath: outputPath,
            success: true
          });
        })
        .on('error', (error) => {
          console.error('Video combination error:', error);
          reject(error);
        })
        .run();
    });
  }

  async applyPostProcessing(videoResult, videoConfig) {
    try {
      // Get file stats
      const stats = fs.statSync(videoResult.outputPath);
      const fileSize = stats.size;

      // Apply additional post-processing if needed
      // For now, just return the result with metadata
      return {
        outputPath: videoResult.outputPath,
        fileSize: fileSize,
        fileSizeMB: Math.round(fileSize / (1024 * 1024) * 100) / 100,
        processed: true
      };
    } catch (error) {
      console.error('Post-processing error:', error);
      return videoResult;
    }
  }

  async cleanupTempFiles(tempFiles) {
    try {
      for (const filePath of tempFiles) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Clean up frame directory
      const frameFiles = fs.readdirSync(this.framesDir);
      for (const file of frameFiles) {
        const filePath = path.join(this.framesDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      // Don't throw error for cleanup issues
    }
  }

  // Utility methods

  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  async createVideoThumbnail(videoPath, timeOffset = '00:00:01') {
    const thumbnailPath = path.join(this.tempDir, `thumbnail_${uuidv4()}.jpg`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timeOffset)
        .frames(1)
        .size('320x240')
        .output(thumbnailPath)
        .on('end', () => {
          resolve(thumbnailPath);
        })
        .on('error', reject)
        .run();
    });
  }

  getAvailableQualities() {
    return Object.keys(this.qualityPresets).map(key => ({
      key: key,
      name: this.qualityPresets[key].name,
      width: this.qualityPresets[key].width,
      height: this.qualityPresets[key].height,
      fps: this.qualityPresets[key].fps
    }));
  }

  calculateEstimatedFileSize(duration, quality) {
    const preset = this.qualityPresets[quality] || this.qualityPresets['4k'];
    const videoBitrate = parseInt(preset.bitrate.replace('k', '')) * 1000; // Convert to bps
    const audioBitrate = parseInt(preset.audioBitrate.replace('k', '')) * 1000; // Convert to bps
    
    const totalBitrate = videoBitrate + audioBitrate;
    const estimatedSizeBytes = (totalBitrate * duration) / 8; // Convert bits to bytes
    const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);
    
    return {
      sizeBytes: Math.round(estimatedSizeBytes),
      sizeMB: Math.round(estimatedSizeMB * 100) / 100,
      sizeGB: Math.round((estimatedSizeMB / 1024) * 100) / 100
    };
  }
}

module.exports = new VideoGenerator();