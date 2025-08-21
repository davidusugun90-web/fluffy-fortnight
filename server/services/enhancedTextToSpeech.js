const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class EnhancedTextToSpeechService {
  constructor() {
    this.audioDir = path.join(__dirname, '..', 'audio');
    this.ensureDirectoryExists(this.audioDir);
    
    // ElevenLabs configuration
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    this.elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';
    
    // Enhanced voice library with ElevenLabs voices
    this.enhancedVoices = {
      female: {
        'sarah_premium': {
          name: 'Sarah Premium',
          description: 'Ultra-realistic warm and friendly female voice',
          service: 'elevenlabs',
          voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
          language: 'en-US',
          style: 'conversational',
          quality: 'premium',
          emotions: ['neutral', 'happy', 'excited', 'calm']
        },
        'emma_premium': {
          name: 'Emma Premium',
          description: 'Professional and crystal-clear female voice',
          service: 'elevenlabs',
          voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi voice
          language: 'en-US',
          style: 'professional',
          quality: 'premium',
          emotions: ['neutral', 'confident', 'serious', 'friendly']
        },
        'sophia_premium': {
          name: 'Sophia Premium',
          description: 'Elegant and sophisticated narrator voice',
          service: 'elevenlabs',
          voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella voice
          language: 'en-US',
          style: 'elegant',
          quality: 'premium',
          emotions: ['neutral', 'sophisticated', 'warm', 'mysterious']
        },
        'mia_premium': {
          name: 'Mia Premium',
          description: 'Young and energetic with perfect clarity',
          service: 'elevenlabs',
          voiceId: 'ErXwobaYiN019PkySvjV', // Antoni voice (can be used for young female)
          language: 'en-US',
          style: 'energetic',
          quality: 'premium',
          emotions: ['neutral', 'excited', 'playful', 'enthusiastic']
        },
        'olivia_premium': {
          name: 'Olivia Premium',
          description: 'Calm and therapeutic with emotional depth',
          service: 'elevenlabs',
          voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli voice
          language: 'en-US',
          style: 'soothing',
          quality: 'premium',
          emotions: ['neutral', 'calm', 'soothing', 'gentle']
        }
      },
      male: {
        'david_premium': {
          name: 'David Premium',
          description: 'Deep and authoritative with commanding presence',
          service: 'elevenlabs',
          voiceId: 'VR6AewLTigWG4xSOukaG', // Arnold voice
          language: 'en-US',
          style: 'authoritative',
          quality: 'premium',
          emotions: ['neutral', 'confident', 'serious', 'commanding']
        },
        'james_premium': {
          name: 'James Premium',
          description: 'Smooth and charismatic storyteller',
          service: 'elevenlabs',
          voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh voice
          language: 'en-US',
          style: 'charismatic',
          quality: 'premium',
          emotions: ['neutral', 'charming', 'warm', 'engaging']
        },
        'michael_premium': {
          name: 'Michael Premium',
          description: 'Friendly and approachable with perfect diction',
          service: 'elevenlabs',
          voiceId: 'rLHFaiAiml8RNEhe6fDB', // Adam voice
          language: 'en-US',
          style: 'friendly',
          quality: 'premium',
          emotions: ['neutral', 'friendly', 'happy', 'encouraging']
        },
        'alexander_premium': {
          name: 'Alexander Premium',
          description: 'Professional and confident business voice',
          service: 'elevenlabs',
          voiceId: 'yoZ06aMxZJJ28mfd3POQ', // Sam voice
          language: 'en-US',
          style: 'professional',
          quality: 'premium',
          emotions: ['neutral', 'confident', 'professional', 'assertive']
        },
        'william_premium': {
          name: 'William Premium',
          description: 'Warm storytelling with emotional range',
          service: 'elevenlabs',
          voiceId: 'CYw3kZ02Hs0563khs1Fj', // Dave voice
          language: 'en-US',
          style: 'storytelling',
          quality: 'premium',
          emotions: ['neutral', 'warm', 'dramatic', 'inspiring']
        }
      }
    };

    // Voice settings for different emotions and styles
    this.voiceSettings = {
      stability: 0.75,    // Voice consistency (0-1)
      similarity_boost: 0.8, // Voice similarity (0-1)
      style: 0.3,         // Style exaggeration (0-1)
      use_speaker_boost: true
    };

    // Audio quality settings
    this.audioSettings = {
      model_id: 'eleven_multilingual_v2', // Latest multilingual model
      output_format: 'mp3_44100_128',     // High quality MP3
      optimize_streaming_latency: 0,      // Max quality
      voice_settings: this.voiceSettings
    };
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async generateEnhancedSpeech(text, voiceId, options = {}, progressCallback) {
    try {
      progressCallback && progressCallback(5, 'Initializing enhanced voice synthesis...');

      // Get voice configuration
      const voice = this.getEnhancedVoiceById(voiceId);
      if (!voice) {
        throw new Error(`Enhanced voice ${voiceId} not found`);
      }

      progressCallback && progressCallback(15, 'Connecting to ElevenLabs...');

      // Prepare request for ElevenLabs
      const requestData = {
        text: text,
        model_id: options.model_id || this.audioSettings.model_id,
        voice_settings: {
          ...this.voiceSettings,
          ...options.voice_settings
        }
      };

      // Add emotion if specified
      if (options.emotion && voice.emotions.includes(options.emotion)) {
        requestData.voice_settings.style = this.getEmotionStyleValue(options.emotion);
      }

      progressCallback && progressCallback(30, 'Generating premium voice...');

      // Make request to ElevenLabs API
      const response = await axios({
        method: 'POST',
        url: `${this.elevenLabsBaseUrl}/text-to-speech/${voice.voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey
        },
        data: requestData,
        responseType: 'arraybuffer'
      });

      progressCallback && progressCallback(70, 'Processing audio data...');

      // Save audio file
      const audioFilename = `elevenlabs_${voiceId}_${Date.now()}_${uuidv4()}.mp3`;
      const audioPath = path.join(this.audioDir, audioFilename);

      fs.writeFileSync(audioPath, response.data);

      progressCallback && progressCallback(85, 'Extracting phoneme data...');

      // Extract phonemes for lip sync (enhanced)
      const phonemes = await this.extractEnhancedPhonemes(text, voice, options);

      progressCallback && progressCallback(95, 'Finalizing audio...');

      // Calculate accurate duration
      const duration = await this.getAudioDuration(audioPath);

      progressCallback && progressCallback(100, 'Enhanced voice generation complete');

      return {
        audioFile: audioPath,
        audioFilename,
        duration,
        phonemes,
        voice: voice.name,
        voiceId: voiceId,
        service: 'elevenlabs',
        quality: 'premium',
        emotion: options.emotion || 'neutral',
        generatedAt: new Date(),
        metadata: {
          model: requestData.model_id,
          settings: requestData.voice_settings,
          fileSize: response.data.length,
          sampleRate: 44100,
          bitrate: 128
        }
      };
    } catch (error) {
      console.error('Enhanced TTS generation error:', error);
      
      // Fallback to standard TTS if ElevenLabs fails
      console.log('Falling back to standard TTS...');
      return this.generateFallbackSpeech(text, voiceId, options, progressCallback);
    }
  }

  getEmotionStyleValue(emotion) {
    const emotionMap = {
      'neutral': 0.3,
      'happy': 0.6,
      'excited': 0.8,
      'calm': 0.1,
      'confident': 0.5,
      'serious': 0.2,
      'friendly': 0.4,
      'sophisticated': 0.3,
      'warm': 0.4,
      'mysterious': 0.7,
      'playful': 0.7,
      'enthusiastic': 0.9,
      'soothing': 0.1,
      'gentle': 0.2,
      'commanding': 0.6,
      'charming': 0.5,
      'engaging': 0.6,
      'encouraging': 0.4,
      'professional': 0.3,
      'assertive': 0.5,
      'dramatic': 0.8,
      'inspiring': 0.7
    };

    return emotionMap[emotion] || 0.3;
  }

  async extractEnhancedPhonemes(text, voice, options) {
    try {
      // Enhanced phoneme extraction with better accuracy
      const words = text.toLowerCase().split(/\s+/);
      const phonemes = [];
      let timeOffset = 0;

      // Calculate speaking rate based on voice and emotion
      const baseRate = this.calculateSpeakingRate(voice, options.emotion);

      for (const word of words) {
        const wordPhonemes = await this.getWordPhonemes(word);
        const wordDuration = this.calculateWordDuration(word, baseRate);
        const phonemeDuration = wordDuration / wordPhonemes.length;

        for (let i = 0; i < wordPhonemes.length; i++) {
          const phoneme = wordPhonemes[i];
          
          phonemes.push({
            phoneme: phoneme,
            start: timeOffset,
            end: timeOffset + phonemeDuration,
            word: word,
            confidence: 0.95, // Higher confidence with ElevenLabs
            intensity: this.calculatePhonemeIntensity(phoneme, options.emotion),
            voiceCharacteristics: {
              pitch: this.calculatePitchVariation(phoneme, voice),
              volume: this.calculateVolumeVariation(phoneme, options.emotion),
              formants: this.calculateFormants(phoneme)
            }
          });
          
          timeOffset += phonemeDuration;
        }
        
        // Add realistic pause between words
        timeOffset += this.calculateWordPause(word, baseRate);
      }

      return phonemes;
    } catch (error) {
      console.error('Enhanced phoneme extraction error:', error);
      // Fallback to basic phoneme extraction
      return this.extractBasicPhonemes(text);
    }
  }

  calculateSpeakingRate(voice, emotion) {
    let baseRate = 150; // words per minute
    
    // Adjust based on voice style
    switch (voice.style) {
      case 'professional':
        baseRate = 140;
        break;
      case 'storytelling':
        baseRate = 130;
        break;
      case 'energetic':
        baseRate = 170;
        break;
      case 'soothing':
        baseRate = 120;
        break;
      default:
        baseRate = 150;
    }

    // Adjust based on emotion
    switch (emotion) {
      case 'excited':
      case 'enthusiastic':
        baseRate *= 1.2;
        break;
      case 'calm':
      case 'soothing':
        baseRate *= 0.8;
        break;
      case 'dramatic':
        baseRate *= 0.9;
        break;
      default:
        break;
    }

    return baseRate;
  }

  async getWordPhonemes(word) {
    // Enhanced phonetic dictionary with more accurate mappings
    const enhancedPhoneticMap = {
      // Common words with accurate phoneme sequences
      'hello': ['HH', 'AH', 'L', 'OW'],
      'world': ['W', 'ER', 'L', 'D'],
      'beautiful': ['B', 'Y', 'UW', 'T', 'AH', 'F', 'AH', 'L'],
      'amazing': ['AH', 'M', 'EY', 'Z', 'IH', 'NG'],
      'wonderful': ['W', 'AH', 'N', 'D', 'ER', 'F', 'AH', 'L'],
      'fantastic': ['F', 'AE', 'N', 'T', 'AE', 'S', 'T', 'IH', 'K'],
      'incredible': ['IH', 'N', 'K', 'R', 'EH', 'D', 'AH', 'B', 'AH', 'L'],
      'outstanding': ['AW', 'T', 'S', 'T', 'AE', 'N', 'D', 'IH', 'NG'],
      'excellent': ['EH', 'K', 'S', 'AH', 'L', 'AH', 'N', 'T'],
      'perfect': ['P', 'ER', 'F', 'IH', 'K', 'T'],
      'welcome': ['W', 'EH', 'L', 'K', 'AH', 'M'],
      'thank': ['TH', 'AE', 'NG', 'K'],
      'please': ['P', 'L', 'IY', 'Z'],
      'sorry': ['S', 'AA', 'R', 'IY'],
      'excuse': ['IH', 'K', 'S', 'K', 'Y', 'UW', 'Z'],
      'understand': ['AH', 'N', 'D', 'ER', 'S', 'T', 'AE', 'N', 'D'],
      'important': ['IH', 'M', 'P', 'AO', 'R', 'T', 'AH', 'N', 'T'],
      'information': ['IH', 'N', 'F', 'ER', 'M', 'EY', 'SH', 'AH', 'N'],
      'technology': ['T', 'EH', 'K', 'N', 'AA', 'L', 'AH', 'JH', 'IY'],
      'artificial': ['AA', 'R', 'T', 'AH', 'F', 'IH', 'SH', 'AH', 'L'],
      'intelligence': ['IH', 'N', 'T', 'EH', 'L', 'AH', 'JH', 'AH', 'N', 'S']
    };

    if (enhancedPhoneticMap[word]) {
      return enhancedPhoneticMap[word];
    }

    // Advanced phoneme generation for unknown words
    return this.generatePhonemeSequence(word);
  }

  generatePhonemeSequence(word) {
    // More sophisticated phoneme generation
    const vowels = {
      'a': ['AH', 'AE'],
      'e': ['EH', 'IY'],
      'i': ['IH', 'IY'],
      'o': ['OW', 'AA'],
      'u': ['UH', 'UW'],
      'y': ['IY', 'Y']
    };

    const consonants = {
      'b': 'B', 'c': 'K', 'd': 'D', 'f': 'F', 'g': 'G',
      'h': 'HH', 'j': 'JH', 'k': 'K', 'l': 'L', 'm': 'M',
      'n': 'N', 'p': 'P', 'q': 'K', 'r': 'R', 's': 'S',
      't': 'T', 'v': 'V', 'w': 'W', 'x': 'K', 'z': 'Z'
    };

    const phonemes = [];
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      
      if (vowels[char]) {
        // Choose appropriate vowel sound based on context
        const vowelOptions = vowels[char];
        phonemes.push(vowelOptions[i % vowelOptions.length]);
      } else if (consonants[char]) {
        phonemes.push(consonants[char]);
      } else if (char === 'c' && i < word.length - 1 && word[i + 1] === 'h') {
        phonemes.push('CH');
        i++; // Skip the 'h'
      } else if (char === 's' && i < word.length - 1 && word[i + 1] === 'h') {
        phonemes.push('SH');
        i++; // Skip the 'h'
      } else if (char === 't' && i < word.length - 1 && word[i + 1] === 'h') {
        phonemes.push('TH');
        i++; // Skip the 'h'
      }
    }

    return phonemes.length > 0 ? phonemes : ['AH']; // Fallback
  }

  calculateWordDuration(word, speakingRate) {
    // More accurate duration calculation
    const syllableCount = this.countSyllables(word);
    const baseTime = (60 / speakingRate) * (syllableCount / 2); // Average syllables per word
    
    // Adjust for word complexity
    const complexityFactor = Math.min(word.length / 6, 1.5);
    
    return baseTime * complexityFactor;
  }

  countSyllables(word) {
    // Simple syllable counting algorithm
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowelGroups = word.match(/[aeiouy]+/g);
    let syllableCount = vowelGroups ? vowelGroups.length : 1;
    
    // Adjust for silent 'e'
    if (word.endsWith('e')) syllableCount--;
    
    return Math.max(syllableCount, 1);
  }

  calculateWordPause(word, speakingRate) {
    // Calculate natural pauses between words
    const basePause = 60 / speakingRate * 0.1; // 10% of average word time
    
    // Longer pause after punctuation
    if (word.match(/[.!?]$/)) {
      return basePause * 3;
    } else if (word.match(/[,;:]$/)) {
      return basePause * 2;
    }
    
    return basePause;
  }

  calculatePhonemeIntensity(phoneme, emotion) {
    let baseIntensity = 0.8;
    
    // Adjust intensity based on phoneme type
    const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
    const strongConsonants = ['P', 'B', 'T', 'D', 'K', 'G', 'F', 'V', 'S', 'Z', 'SH', 'ZH', 'CH', 'JH'];
    
    if (vowels.includes(phoneme)) {
      baseIntensity *= 1.2;
    } else if (strongConsonants.includes(phoneme)) {
      baseIntensity *= 1.1;
    }

    // Adjust based on emotion
    switch (emotion) {
      case 'excited':
      case 'enthusiastic':
        baseIntensity *= 1.3;
        break;
      case 'calm':
      case 'soothing':
        baseIntensity *= 0.8;
        break;
      case 'dramatic':
        baseIntensity *= 1.4;
        break;
      case 'confident':
        baseIntensity *= 1.1;
        break;
      default:
        break;
    }

    return Math.min(baseIntensity, 1.0);
  }

  calculatePitchVariation(phoneme, voice) {
    // Calculate pitch variations for more natural speech
    const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
    
    let pitchVariation = 0;
    
    if (vowels.includes(phoneme)) {
      // Vowels have more pitch variation
      pitchVariation = (Math.random() - 0.5) * 0.3;
    } else {
      // Consonants have less pitch variation
      pitchVariation = (Math.random() - 0.5) * 0.1;
    }

    return pitchVariation;
  }

  calculateVolumeVariation(phoneme, emotion) {
    let volumeVariation = 0;
    
    // Base volume variation
    const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
    
    if (vowels.includes(phoneme)) {
      volumeVariation = 0.1; // Vowels are typically louder
    }

    // Adjust based on emotion
    switch (emotion) {
      case 'excited':
      case 'enthusiastic':
        volumeVariation += 0.2;
        break;
      case 'calm':
      case 'soothing':
        volumeVariation -= 0.1;
        break;
      case 'commanding':
        volumeVariation += 0.15;
        break;
      default:
        break;
    }

    return Math.max(-0.3, Math.min(0.3, volumeVariation));
  }

  calculateFormants(phoneme) {
    // Calculate formant frequencies for accurate lip sync
    const formantMap = {
      // Vowels with their characteristic formant frequencies
      'IY': { f1: 270, f2: 2290, f3: 3010 }, // "see"
      'IH': { f1: 390, f2: 1990, f3: 2550 }, // "sit"
      'EH': { f1: 530, f2: 1840, f3: 2480 }, // "get"
      'AE': { f1: 660, f2: 1720, f3: 2410 }, // "cat"
      'AA': { f1: 730, f2: 1090, f3: 2440 }, // "father"
      'AO': { f1: 570, f2: 840, f3: 2410 },  // "law"
      'UH': { f1: 440, f2: 1020, f3: 2240 }, // "good"
      'UW': { f1: 300, f2: 870, f3: 2240 },  // "two"
      'ER': { f1: 490, f2: 1350, f3: 1690 }, // "her"
      
      // Default for consonants
      'default': { f1: 500, f2: 1500, f3: 2500 }
    };

    return formantMap[phoneme] || formantMap['default'];
  }

  async getAudioDuration(audioPath) {
    try {
      // Use ffprobe to get accurate audio duration
      const { exec } = require('child_process');
      
      return new Promise((resolve, reject) => {
        exec(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`, (error, stdout) => {
          if (error) {
            reject(error);
          } else {
            resolve(parseFloat(stdout.trim()));
          }
        });
      });
    } catch (error) {
      console.error('Duration calculation error:', error);
      // Fallback estimation
      return 5.0; // Default 5 seconds
    }
  }

  getEnhancedVoiceById(voiceId) {
    for (const gender in this.enhancedVoices) {
      if (this.enhancedVoices[gender][voiceId]) {
        return { ...this.enhancedVoices[gender][voiceId], id: voiceId, gender };
      }
    }
    return null;
  }

  async getEnhancedVoices() {
    const voices = [];

    for (const gender in this.enhancedVoices) {
      for (const voiceId in this.enhancedVoices[gender]) {
        const voice = this.enhancedVoices[gender][voiceId];
        voices.push({
          id: voiceId,
          name: voice.name,
          description: voice.description,
          gender: gender,
          service: voice.service,
          quality: voice.quality,
          style: voice.style,
          emotions: voice.emotions,
          available: true
        });
      }
    }

    return voices;
  }

  async generateFallbackSpeech(text, voiceId, options, progressCallback) {
    // Fallback to the original TTS service if ElevenLabs fails
    const originalTTS = require('./textToSpeech');
    return originalTTS.generateSpeech(text, voiceId, options.language || 'en-US', progressCallback);
  }

  async cloneVoice(audioSample, voiceName) {
    try {
      // ElevenLabs voice cloning capability
      const formData = new FormData();
      formData.append('name', voiceName);
      formData.append('files', fs.createReadStream(audioSample));
      formData.append('description', `Custom cloned voice: ${voiceName}`);

      const response = await axios({
        method: 'POST',
        url: `${this.elevenLabsBaseUrl}/voices/add`,
        headers: {
          'xi-api-key': this.elevenLabsApiKey,
        },
        data: formData
      });

      return {
        success: true,
        voiceId: response.data.voice_id,
        voiceName: voiceName,
        clonedAt: new Date()
      };
    } catch (error) {
      console.error('Voice cloning error:', error);
      throw new Error(`Failed to clone voice: ${error.message}`);
    }
  }

  async getVoiceUsage() {
    try {
      // Get ElevenLabs usage statistics
      const response = await axios({
        method: 'GET',
        url: `${this.elevenLabsBaseUrl}/user/subscription`,
        headers: {
          'xi-api-key': this.elevenLabsApiKey
        }
      });

      return {
        charactersUsed: response.data.character_count,
        charactersLimit: response.data.character_limit,
        resetDate: response.data.next_character_count_reset_unix,
        canReset: response.data.can_extend_character_limit
      };
    } catch (error) {
      console.error('Usage check error:', error);
      return null;
    }
  }
}

module.exports = new EnhancedTextToSpeechService();