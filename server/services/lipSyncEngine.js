const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

class LipSyncEngine {
  constructor() {
    this.processedDir = path.join(__dirname, '..', 'processed');
    this.tempDir = path.join(__dirname, '..', 'temp');
    this.ensureDirectoryExists(this.processedDir);
    this.ensureDirectoryExists(this.tempDir);

    // Phoneme to viseme mapping for accurate lip sync
    this.phonemeToViseme = {
      // Silence/Rest
      'SIL': 'A',
      'SP': 'A',
      
      // Vowels
      'AA': 'E', // as in "father"
      'AE': 'D', // as in "cat"
      'AH': 'D', // as in "but"
      'AO': 'O', // as in "law"
      'AW': 'C', // as in "how"
      'AY': 'D', // as in "hide"
      'EH': 'D', // as in "red"
      'ER': 'E', // as in "her"
      'EY': 'D', // as in "ate"
      'IH': 'B', // as in "sit"
      'IY': 'B', // as in "see"
      'OW': 'O', // as in "show"
      'OY': 'O', // as in "toy"
      'UH': 'C', // as in "good"
      'UW': 'O', // as in "two"
      
      // Consonants
      'B': 'M',  // as in "bee"
      'CH': 'F', // as in "cheese"
      'D': 'F',  // as in "dee"
      'DH': 'F', // as in "thee"
      'F': 'F',  // as in "fee"
      'G': 'F',  // as in "green"
      'HH': 'A', // as in "he"
      'JH': 'F', // as in "gee"
      'K': 'F',  // as in "key"
      'L': 'F',  // as in "lee"
      'M': 'M',  // as in "me"
      'N': 'F',  // as in "knee"
      'NG': 'F', // as in "ping"
      'P': 'M',  // as in "pee"
      'R': 'F',  // as in "read"
      'S': 'F',  // as in "see"
      'SH': 'F', // as in "she"
      'T': 'F',  // as in "tea"
      'TH': 'F', // as in "theta"
      'V': 'F',  // as in "vee"
      'W': 'C',  // as in "we"
      'Y': 'B',  // as in "yield"
      'Z': 'F',  // as in "zee"
      'ZH': 'F'  // as in "seizure"
    };

    // Viseme mouth shapes and their characteristics
    this.visemes = {
      'A': { // Rest/Neutral
        name: 'Rest',
        mouthWidth: 1.0,
        mouthHeight: 1.0,
        lipSeparation: 0.0,
        jawOpen: 0.0,
        description: 'Neutral mouth position'
      },
      'B': { // Narrow vowels (IH, IY, Y)
        name: 'Narrow',
        mouthWidth: 0.7,
        mouthHeight: 0.8,
        lipSeparation: 0.3,
        jawOpen: 0.2,
        description: 'Narrow mouth opening'
      },
      'C': { // Round vowels (UH, UW, W, AW)
        name: 'Round',
        mouthWidth: 0.6,
        mouthHeight: 0.6,
        lipSeparation: 0.4,
        jawOpen: 0.3,
        description: 'Rounded lips'
      },
      'D': { // Wide vowels (AE, AH, EH, EY, AY)
        name: 'Wide',
        mouthWidth: 1.2,
        mouthHeight: 0.9,
        lipSeparation: 0.6,
        jawOpen: 0.4,
        description: 'Wide mouth opening'
      },
      'E': { // Open vowels (AA, ER)
        name: 'Open',
        mouthWidth: 1.0,
        mouthHeight: 1.3,
        lipSeparation: 0.8,
        jawOpen: 0.7,
        description: 'Open mouth'
      },
      'F': { // Consonants and fricatives
        name: 'Consonant',
        mouthWidth: 0.9,
        mouthHeight: 0.7,
        lipSeparation: 0.2,
        jawOpen: 0.1,
        description: 'Consonant articulation'
      },
      'M': { // Bilabial consonants (M, P, B)
        name: 'Bilabial',
        mouthWidth: 1.0,
        mouthHeight: 0.5,
        lipSeparation: 0.0,
        jawOpen: 0.0,
        description: 'Lips together'
      },
      'O': { // Round open vowels (AO, OW, OY, UW)
        name: 'Round Open',
        mouthWidth: 0.8,
        mouthHeight: 1.1,
        lipSeparation: 0.6,
        jawOpen: 0.5,
        description: 'Round and open'
      }
    };

    // Animation timing parameters
    this.animationSettings = {
      frameRate: 30, // FPS
      transitionDuration: 0.1, // seconds for smooth transitions
      holdDuration: 0.05, // minimum duration to hold a viseme
      blendFactor: 0.3, // how much to blend between visemes
      intensityMultiplier: 1.2 // amplify mouth movements
    };
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async generateLipSync(photoPath, audioFile, progressCallback) {
    try {
      progressCallback && progressCallback(0, 'Initializing lip sync analysis...');

      // Load and analyze the photo
      const photoAnalysis = await this.analyzePhoto(photoPath);
      progressCallback && progressCallback(20, 'Photo analysis complete');

      // Load phoneme data (this should come from TTS service)
      const phonemeData = await this.loadPhonemeData(audioFile);
      progressCallback && progressCallback(40, 'Phoneme data loaded');

      // Generate viseme sequence
      const visemeSequence = await this.generateVisemeSequence(phonemeData);
      progressCallback && progressCallback(60, 'Viseme sequence generated');

      // Create animation keyframes
      const animationKeyframes = await this.generateAnimationKeyframes(
        visemeSequence, 
        photoAnalysis
      );
      progressCallback && progressCallback(80, 'Animation keyframes created');

      // Generate facial landmark animations
      const facialAnimation = await this.generateFacialAnimation(
        animationKeyframes,
        photoAnalysis
      );
      progressCallback && progressCallback(100, 'Lip sync generation complete');

      return {
        lipSyncId: uuidv4(),
        photoAnalysis,
        visemeSequence,
        animationKeyframes,
        facialAnimation,
        duration: this.calculateTotalDuration(visemeSequence),
        frameRate: this.animationSettings.frameRate,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Lip sync generation error:', error);
      throw new Error(`Failed to generate lip sync: ${error.message}`);
    }
  }

  async analyzePhoto(photoPath) {
    try {
      // Load image and get metadata
      const image = sharp(photoPath);
      const metadata = await image.metadata();

      // In production, this would use actual face detection libraries
      // like MediaPipe, face-api.js, or cloud services
      
      // Mock face analysis with realistic facial landmarks
      const faceAnalysis = {
        faceDetected: true,
        confidence: 0.95,
        boundingBox: {
          x: Math.floor(metadata.width * 0.25),
          y: Math.floor(metadata.height * 0.15),
          width: Math.floor(metadata.width * 0.5),
          height: Math.floor(metadata.height * 0.7)
        },
        landmarks: {
          // Mouth landmarks (key points for lip sync)
          mouth: {
            leftCorner: { 
              x: metadata.width * 0.42, 
              y: metadata.height * 0.7 
            },
            rightCorner: { 
              x: metadata.width * 0.58, 
              y: metadata.height * 0.7 
            },
            upperLip: {
              left: { x: metadata.width * 0.45, y: metadata.height * 0.68 },
              center: { x: metadata.width * 0.5, y: metadata.height * 0.67 },
              right: { x: metadata.width * 0.55, y: metadata.height * 0.68 }
            },
            lowerLip: {
              left: { x: metadata.width * 0.45, y: metadata.height * 0.72 },
              center: { x: metadata.width * 0.5, y: metadata.height * 0.73 },
              right: { x: metadata.width * 0.55, y: metadata.height * 0.72 }
            }
          },
          // Additional facial landmarks
          nose: { x: metadata.width * 0.5, y: metadata.height * 0.55 },
          leftEye: { x: metadata.width * 0.42, y: metadata.height * 0.4 },
          rightEye: { x: metadata.width * 0.58, y: metadata.height * 0.4 },
          chin: { x: metadata.width * 0.5, y: metadata.height * 0.85 }
        },
        mouthDimensions: {
          naturalWidth: metadata.width * 0.16,
          naturalHeight: metadata.height * 0.05,
          centerX: metadata.width * 0.5,
          centerY: metadata.height * 0.7
        }
      };

      return faceAnalysis;
    } catch (error) {
      console.error('Photo analysis error:', error);
      throw error;
    }
  }

  async loadPhonemeData(audioFile) {
    try {
      // In production, this would load actual phoneme data from the TTS service
      // or perform audio analysis to extract phonemes
      
      // For demo purposes, create mock phoneme data
      const mockPhonemes = [
        { phoneme: 'HH', start: 0.0, end: 0.1, word: 'hello', confidence: 0.9 },
        { phoneme: 'AH', start: 0.1, end: 0.2, word: 'hello', confidence: 0.95 },
        { phoneme: 'L', start: 0.2, end: 0.3, word: 'hello', confidence: 0.9 },
        { phoneme: 'OW', start: 0.3, end: 0.5, word: 'hello', confidence: 0.95 },
        { phoneme: 'SP', start: 0.5, end: 0.6, word: '', confidence: 1.0 },
        { phoneme: 'W', start: 0.6, end: 0.7, word: 'world', confidence: 0.9 },
        { phoneme: 'ER', start: 0.7, end: 0.9, word: 'world', confidence: 0.95 },
        { phoneme: 'L', start: 0.9, end: 1.0, word: 'world', confidence: 0.9 },
        { phoneme: 'D', start: 1.0, end: 1.1, word: 'world', confidence: 0.9 }
      ];

      return {
        phonemes: mockPhonemes,
        totalDuration: 1.1,
        sampleRate: 22050,
        audioFile: audioFile
      };
    } catch (error) {
      console.error('Phoneme data loading error:', error);
      throw error;
    }
  }

  async generateVisemeSequence(phonemeData) {
    try {
      const visemeSequence = [];
      
      for (const phoneme of phonemeData.phonemes) {
        const viseme = this.phonemeToViseme[phoneme.phoneme] || 'A';
        const visemeData = this.visemes[viseme];

        visemeSequence.push({
          viseme: viseme,
          visemeData: visemeData,
          start: phoneme.start,
          end: phoneme.end,
          duration: phoneme.end - phoneme.start,
          phoneme: phoneme.phoneme,
          word: phoneme.word,
          confidence: phoneme.confidence,
          intensity: this.calculateVisemeIntensity(phoneme.phoneme, phoneme.confidence)
        });
      }

      // Smooth transitions between visemes
      const smoothedSequence = this.smoothVisemeTransitions(visemeSequence);

      return {
        sequence: smoothedSequence,
        totalDuration: phonemeData.totalDuration,
        visemeCount: smoothedSequence.length
      };
    } catch (error) {
      console.error('Viseme sequence generation error:', error);
      throw error;
    }
  }

  calculateVisemeIntensity(phoneme, confidence) {
    // Calculate intensity based on phoneme type and confidence
    const baseIntensity = confidence;
    
    // Vowels typically have higher intensity
    const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
    const isVowel = vowels.includes(phoneme);
    
    // Plosives and fricatives have distinct articulation
    const strongConsonants = ['P', 'B', 'T', 'D', 'K', 'G', 'F', 'V', 'S', 'Z', 'SH', 'ZH'];
    const isStrongConsonant = strongConsonants.includes(phoneme);

    let intensity = baseIntensity;
    
    if (isVowel) {
      intensity *= 1.2;
    } else if (isStrongConsonant) {
      intensity *= 1.1;
    }

    return Math.min(intensity * this.animationSettings.intensityMultiplier, 1.0);
  }

  smoothVisemeTransitions(visemeSequence) {
    const smoothed = [];
    const transitionTime = this.animationSettings.transitionDuration;

    for (let i = 0; i < visemeSequence.length; i++) {
      const current = visemeSequence[i];
      const next = visemeSequence[i + 1];

      // Add the main viseme
      smoothed.push(current);

      // Add transition if there's a next viseme and they're different
      if (next && current.viseme !== next.viseme && (next.start - current.end) > transitionTime) {
        const transitionStart = current.end;
        const transitionEnd = Math.min(current.end + transitionTime, next.start);

        if (transitionEnd > transitionStart) {
          smoothed.push({
            viseme: 'TRANSITION',
            fromViseme: current.viseme,
            toViseme: next.viseme,
            start: transitionStart,
            end: transitionEnd,
            duration: transitionEnd - transitionStart,
            intensity: (current.intensity + next.intensity) / 2,
            isTransition: true
          });
        }
      }
    }

    return smoothed;
  }

  async generateAnimationKeyframes(visemeSequence, photoAnalysis) {
    try {
      const keyframes = [];
      const frameRate = this.animationSettings.frameRate;
      const totalDuration = visemeSequence.totalDuration;
      const totalFrames = Math.ceil(totalDuration * frameRate);

      for (let frame = 0; frame < totalFrames; frame++) {
        const time = frame / frameRate;
        const currentViseme = this.getVisemeAtTime(visemeSequence.sequence, time);
        
        if (currentViseme) {
          const mouthTransform = this.calculateMouthTransform(
            currentViseme, 
            photoAnalysis.mouthDimensions,
            time
          );

          keyframes.push({
            frame: frame,
            time: time,
            viseme: currentViseme.viseme,
            mouthTransform: mouthTransform,
            landmarks: this.calculateAnimatedLandmarks(
              photoAnalysis.landmarks,
              mouthTransform,
              currentViseme.intensity
            )
          });
        }
      }

      return {
        keyframes: keyframes,
        totalFrames: totalFrames,
        frameRate: frameRate,
        duration: totalDuration
      };
    } catch (error) {
      console.error('Animation keyframes generation error:', error);
      throw error;
    }
  }

  getVisemeAtTime(visemeSequence, time) {
    for (const viseme of visemeSequence) {
      if (time >= viseme.start && time <= viseme.end) {
        return viseme;
      }
    }
    return visemeSequence[0]; // Default to first viseme if none found
  }

  calculateMouthTransform(viseme, mouthDimensions, time) {
    if (viseme.isTransition) {
      // Interpolate between two visemes
      const fromVisemeData = this.visemes[viseme.fromViseme];
      const toVisemeData = this.visemes[viseme.toViseme];
      const progress = (time - viseme.start) / viseme.duration;
      
      return {
        width: this.lerp(fromVisemeData.mouthWidth, toVisemeData.mouthWidth, progress),
        height: this.lerp(fromVisemeData.mouthHeight, toVisemeData.mouthHeight, progress),
        lipSeparation: this.lerp(fromVisemeData.lipSeparation, toVisemeData.lipSeparation, progress),
        jawOpen: this.lerp(fromVisemeData.jawOpen, toVisemeData.jawOpen, progress),
        intensity: viseme.intensity
      };
    } else {
      const visemeData = viseme.visemeData;
      return {
        width: visemeData.mouthWidth * viseme.intensity,
        height: visemeData.mouthHeight * viseme.intensity,
        lipSeparation: visemeData.lipSeparation * viseme.intensity,
        jawOpen: visemeData.jawOpen * viseme.intensity,
        intensity: viseme.intensity
      };
    }
  }

  calculateAnimatedLandmarks(originalLandmarks, mouthTransform, intensity) {
    const animated = JSON.parse(JSON.stringify(originalLandmarks)); // Deep copy
    
    // Apply mouth transformation to mouth landmarks
    const mouth = animated.mouth;
    const centerX = mouth.leftCorner.x + (mouth.rightCorner.x - mouth.leftCorner.x) / 2;
    const centerY = mouth.upperLip.center.y + (mouth.lowerLip.center.y - mouth.upperLip.center.y) / 2;
    
    // Transform mouth corners
    const widthScale = mouthTransform.width;
    const heightScale = mouthTransform.height;
    
    mouth.leftCorner.x = centerX - (centerX - mouth.leftCorner.x) * widthScale;
    mouth.rightCorner.x = centerX + (mouth.rightCorner.x - centerX) * widthScale;
    
    // Transform lip positions
    mouth.upperLip.center.y = centerY - (centerY - mouth.upperLip.center.y) * heightScale;
    mouth.lowerLip.center.y = centerY + (mouth.lowerLip.center.y - centerY) * heightScale;
    
    // Apply lip separation
    const separation = mouthTransform.lipSeparation * 5; // Scale factor
    mouth.upperLip.center.y -= separation / 2;
    mouth.lowerLip.center.y += separation / 2;
    
    // Apply jaw opening (affects chin position slightly)
    animated.chin.y += mouthTransform.jawOpen * 10;

    return animated;
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  async generateFacialAnimation(animationKeyframes, photoAnalysis) {
    try {
      const facialAnimation = {
        animationId: uuidv4(),
        keyframes: animationKeyframes.keyframes,
        metadata: {
          totalFrames: animationKeyframes.totalFrames,
          frameRate: animationKeyframes.frameRate,
          duration: animationKeyframes.duration,
          faceRegion: photoAnalysis.boundingBox,
          mouthRegion: photoAnalysis.mouthDimensions
        },
        morphTargets: this.generateMorphTargets(photoAnalysis),
        blendShapes: this.generateBlendShapes(),
        animationCurves: this.generateAnimationCurves(animationKeyframes.keyframes)
      };

      return facialAnimation;
    } catch (error) {
      console.error('Facial animation generation error:', error);
      throw error;
    }
  }

  generateMorphTargets(photoAnalysis) {
    // Generate morph targets for different mouth shapes
    const morphTargets = {};
    
    for (const [visemeKey, visemeData] of Object.entries(this.visemes)) {
      morphTargets[visemeKey] = {
        name: visemeData.name,
        description: visemeData.description,
        vertices: this.calculateMorphVertices(photoAnalysis, visemeData)
      };
    }

    return morphTargets;
  }

  calculateMorphVertices(photoAnalysis, visemeData) {
    // Calculate vertex positions for this viseme
    const baseVertices = this.getBaseMouthVertices(photoAnalysis.mouthDimensions);
    const morphedVertices = [];

    for (const vertex of baseVertices) {
      const morphedVertex = {
        x: vertex.x * visemeData.mouthWidth,
        y: vertex.y * visemeData.mouthHeight,
        intensity: visemeData.lipSeparation
      };
      morphedVertices.push(morphedVertex);
    }

    return morphedVertices;
  }

  getBaseMouthVertices(mouthDimensions) {
    // Define base mouth vertices in a normalized coordinate system
    return [
      { x: -0.5, y: 0, label: 'leftCorner' },
      { x: 0.5, y: 0, label: 'rightCorner' },
      { x: -0.3, y: -0.3, label: 'upperLipLeft' },
      { x: 0, y: -0.4, label: 'upperLipCenter' },
      { x: 0.3, y: -0.3, label: 'upperLipRight' },
      { x: -0.3, y: 0.3, label: 'lowerLipLeft' },
      { x: 0, y: 0.4, label: 'lowerLipCenter' },
      { x: 0.3, y: 0.3, label: 'lowerLipRight' }
    ];
  }

  generateBlendShapes() {
    // Generate blend shapes for smooth animation
    return {
      mouthOpen: { weight: 0, target: 'E' },
      mouthWide: { weight: 0, target: 'D' },
      mouthNarrow: { weight: 0, target: 'B' },
      mouthRound: { weight: 0, target: 'O' },
      lipsTogether: { weight: 0, target: 'M' },
      consonantShape: { weight: 0, target: 'F' }
    };
  }

  generateAnimationCurves(keyframes) {
    // Generate smooth animation curves for interpolation
    const curves = {
      mouthWidth: [],
      mouthHeight: [],
      lipSeparation: [],
      jawOpen: [],
      intensity: []
    };

    for (const keyframe of keyframes) {
      const transform = keyframe.mouthTransform;
      
      curves.mouthWidth.push({ time: keyframe.time, value: transform.width });
      curves.mouthHeight.push({ time: keyframe.time, value: transform.height });
      curves.lipSeparation.push({ time: keyframe.time, value: transform.lipSeparation });
      curves.jawOpen.push({ time: keyframe.time, value: transform.jawOpen });
      curves.intensity.push({ time: keyframe.time, value: transform.intensity });
    }

    return curves;
  }

  calculateTotalDuration(visemeSequence) {
    if (visemeSequence.sequence.length === 0) return 0;
    
    const lastViseme = visemeSequence.sequence[visemeSequence.sequence.length - 1];
    return lastViseme.end;
  }

  // Utility methods for advanced lip sync features

  async adjustLipSyncTiming(lipSyncData, timingOffset) {
    // Adjust timing of all keyframes by offset
    const adjusted = JSON.parse(JSON.stringify(lipSyncData));
    
    adjusted.facialAnimation.keyframes.forEach(keyframe => {
      keyframe.time += timingOffset;
    });

    adjusted.visemeSequence.sequence.forEach(viseme => {
      viseme.start += timingOffset;
      viseme.end += timingOffset;
    });

    return adjusted;
  }

  async enhanceLipSyncRealism(lipSyncData, enhancementLevel = 1.0) {
    // Add subtle variations and micro-expressions for realism
    const enhanced = JSON.parse(JSON.stringify(lipSyncData));
    
    enhanced.facialAnimation.keyframes.forEach((keyframe, index) => {
      // Add subtle random variations
      const variation = (Math.random() - 0.5) * 0.1 * enhancementLevel;
      keyframe.mouthTransform.intensity += variation;
      keyframe.mouthTransform.intensity = Math.max(0, Math.min(1, keyframe.mouthTransform.intensity));
      
      // Add micro-pauses for natural speech rhythm
      if (index % 10 === 0 && Math.random() < 0.3) {
        keyframe.mouthTransform.lipSeparation *= 0.8;
      }
    });

    return enhanced;
  }
}

module.exports = new LipSyncEngine();