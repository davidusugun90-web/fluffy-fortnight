const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const textToSpeech = require('@google-cloud/text-to-speech');

class TextToSpeechService {
  constructor() {
    this.audioDir = path.join(__dirname, '..', 'audio');
    this.ensureDirectoryExists(this.audioDir);
    
    // Initialize Google Cloud TTS client (fallback to local synthesis)
    try {
      this.client = new textToSpeech.TextToSpeechClient();
      this.hasCloudTTS = true;
    } catch (error) {
      console.warn('Google Cloud TTS not available, using fallback synthesis');
      this.hasCloudTTS = false;
    }

    // Define high-quality voice options
    this.voices = {
      female: {
        'sarah': {
          name: 'Sarah',
          description: 'Warm and friendly female voice',
          language: 'en-US',
          cloudVoice: 'en-US-Wavenet-F',
          pitch: 0,
          speed: 1.0,
          style: 'conversational'
        },
        'emma': {
          name: 'Emma',
          description: 'Professional and clear female voice',
          language: 'en-US',
          cloudVoice: 'en-US-Wavenet-G',
          pitch: 2,
          speed: 0.95,
          style: 'professional'
        },
        'sophia': {
          name: 'Sophia',
          description: 'Elegant and sophisticated female voice',
          language: 'en-US',
          cloudVoice: 'en-US-Wavenet-H',
          pitch: -1,
          speed: 0.9,
          style: 'elegant'
        },
        'mia': {
          name: 'Mia',
          description: 'Young and energetic female voice',
          language: 'en-US',
          cloudVoice: 'en-US-Wavenet-E',
          pitch: 3,
          speed: 1.1,
          style: 'energetic'
        },
        'olivia': {
          name: 'Olivia',
          description: 'Calm and soothing female voice',
          language: 'en-US',
          cloudVoice: 'en-US-Neural2-F',
          pitch: -2,
          speed: 0.85,
          style: 'soothing'
        }
      },
      male: {
        'david': {
          name: 'David',
          description: 'Deep and authoritative male voice',
          language: 'en-US',
          cloudVoice: 'en-US-Wavenet-D',
          pitch: -3,
          speed: 0.9,
          style: 'authoritative'
        },
        'james': {
          name: 'James',
          description: 'Smooth and charismatic male voice',
          language: 'en-US',
          cloudVoice: 'en-US-Wavenet-A',
          pitch: 0,
          speed: 1.0,
          style: 'charismatic'
        },
        'michael': {
          name: 'Michael',
          description: 'Friendly and approachable male voice',
          language: 'en-US',
          cloudVoice: 'en-US-Wavenet-B',
          pitch: 1,
          speed: 1.05,
          style: 'friendly'
        },
        'alexander': {
          name: 'Alexander',
          description: 'Professional and confident male voice',
          language: 'en-US',
          cloudVoice: 'en-US-Neural2-D',
          pitch: -1,
          speed: 0.95,
          style: 'professional'
        },
        'william': {
          name: 'William',
          description: 'Warm and storytelling male voice',
          language: 'en-US',
          cloudVoice: 'en-US-Neural2-A',
          pitch: 0,
          speed: 0.9,
          style: 'storytelling'
        }
      }
    };
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async generateSpeech(text, voiceId, language = 'en-US', progressCallback) {
    try {
      progressCallback && progressCallback(10);

      // Validate voice
      const voice = this.getVoiceById(voiceId);
      if (!voice) {
        throw new Error(`Voice ${voiceId} not found`);
      }

      progressCallback && progressCallback(30);

      // Generate audio file
      let audioBuffer;
      let phonemes = [];

      if (this.hasCloudTTS) {
        const result = await this.generateCloudTTS(text, voice, language);
        audioBuffer = result.audioBuffer;
        phonemes = result.phonemes;
      } else {
        const result = await this.generateLocalTTS(text, voice);
        audioBuffer = result.audioBuffer;
        phonemes = result.phonemes;
      }

      progressCallback && progressCallback(70);

      // Save audio file
      const audioFilename = `tts_${voiceId}_${Date.now()}_${uuidv4()}.mp3`;
      const audioPath = path.join(this.audioDir, audioFilename);

      fs.writeFileSync(audioPath, audioBuffer);

      progressCallback && progressCallback(90);

      // Calculate duration (approximate)
      const duration = this.estimateAudioDuration(text, voice.speed);

      progressCallback && progressCallback(100);

      return {
        audioFile: audioPath,
        audioFilename,
        duration,
        phonemes,
        voice: voice.name,
        language,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('TTS generation error:', error);
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  async generateCloudTTS(text, voice, language) {
    try {
      // Prepare the request
      const request = {
        input: { text: text },
        voice: {
          languageCode: language,
          name: voice.cloudVoice,
          ssmlGender: voice.cloudVoice.includes('F') || voice.cloudVoice.includes('G') || voice.cloudVoice.includes('H') || voice.cloudVoice.includes('E') ? 'FEMALE' : 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: voice.pitch,
          speakingRate: voice.speed,
          volumeGainDb: 0.0,
          effectsProfileId: ['telephony-class-application']
        },
        enableTimePointing: ['SSML_MARK']
      };

      // Generate speech
      const [response] = await this.client.synthesizeSpeech(request);
      
      // Extract phonemes for lip sync (simplified)
      const phonemes = this.extractPhonemesFromText(text);

      return {
        audioBuffer: response.audioContent,
        phonemes
      };
    } catch (error) {
      console.error('Cloud TTS error:', error);
      throw error;
    }
  }

  async generateLocalTTS(text, voice) {
    try {
      // Fallback to local TTS synthesis
      // This would integrate with espeak, festival, or other local TTS engines
      
      // For demo purposes, create a mock audio buffer
      // In production, you'd use actual TTS synthesis
      const mockAudioBuffer = this.generateMockAudio(text, voice);
      const phonemes = this.extractPhonemesFromText(text);

      return {
        audioBuffer: mockAudioBuffer,
        phonemes
      };
    } catch (error) {
      console.error('Local TTS error:', error);
      throw error;
    }
  }

  generateMockAudio(text, voice) {
    // Generate a simple sine wave audio for demo purposes
    // In production, this would be replaced with actual TTS synthesis
    
    const duration = this.estimateAudioDuration(text, voice.speed);
    const sampleRate = 22050;
    const samples = Math.floor(duration * sampleRate);
    
    // Create a simple audio buffer (this is just for demo)
    const buffer = Buffer.alloc(samples * 2); // 16-bit samples
    
    for (let i = 0; i < samples; i++) {
      // Generate a simple tone that varies based on text
      const frequency = 440 + (text.charCodeAt(i % text.length) % 200);
      const amplitude = 0.3 * Math.sin(2 * Math.PI * frequency * i / sampleRate);
      const sample = Math.floor(amplitude * 32767);
      
      buffer.writeInt16LE(sample, i * 2);
    }

    return buffer;
  }

  extractPhonemesFromText(text) {
    // Simplified phoneme extraction for lip sync
    // In production, you'd use a proper phoneme analysis tool
    
    const words = text.toLowerCase().split(/\s+/);
    const phonemes = [];
    let timeOffset = 0;

    words.forEach((word, wordIndex) => {
      const wordDuration = word.length * 0.1; // Approximate duration per character
      
      // Basic phoneme mapping (simplified)
      const phoneticMapping = this.getPhoneticMapping(word);
      
      phoneticMapping.forEach((phoneme, phonemeIndex) => {
        const phonemeDuration = wordDuration / phoneticMapping.length;
        
        phonemes.push({
          phoneme: phoneme,
          start: timeOffset,
          end: timeOffset + phonemeDuration,
          word: word,
          wordIndex: wordIndex,
          confidence: 0.9
        });
        
        timeOffset += phonemeDuration;
      });
      
      // Add pause between words
      timeOffset += 0.1;
    });

    return phonemes;
  }

  getPhoneticMapping(word) {
    // Simplified phonetic mapping
    // In production, you'd use a proper phonetic dictionary or CMU Pronouncing Dictionary
    
    const phoneticMap = {
      'hello': ['HH', 'AH', 'L', 'OW'],
      'world': ['W', 'ER', 'L', 'D'],
      'the': ['DH', 'AH'],
      'and': ['AH', 'N', 'D'],
      'you': ['Y', 'UW'],
      'are': ['AA', 'R'],
      'is': ['IH', 'Z'],
      'it': ['IH', 'T'],
      'to': ['T', 'UW'],
      'of': ['AH', 'V'],
      'in': ['IH', 'N'],
      'for': ['F', 'ER'],
      'with': ['W', 'IH', 'TH'],
      'on': ['AA', 'N'],
      'at': ['AE', 'T'],
      'by': ['B', 'AY'],
      'this': ['DH', 'IH', 'S'],
      'that': ['DH', 'AE', 'T'],
      'have': ['HH', 'AE', 'V'],
      'has': ['HH', 'AE', 'Z'],
      'was': ['W', 'AH', 'Z'],
      'were': ['W', 'ER'],
      'will': ['W', 'IH', 'L'],
      'can': ['K', 'AE', 'N'],
      'could': ['K', 'UH', 'D'],
      'would': ['W', 'UH', 'D'],
      'should': ['SH', 'UH', 'D']
    };

    // Return mapped phonemes or create basic mapping
    if (phoneticMap[word]) {
      return phoneticMap[word];
    }

    // Basic fallback mapping
    return word.split('').map(char => {
      const vowels = 'aeiou';
      return vowels.includes(char.toLowerCase()) ? 'AH' : char.toUpperCase();
    });
  }

  estimateAudioDuration(text, speed = 1.0) {
    // Estimate duration based on text length and speaking rate
    const wordsPerMinute = 150 * speed; // Average speaking rate
    const wordCount = text.split(/\s+/).length;
    const minutes = wordCount / wordsPerMinute;
    return minutes * 60; // Return duration in seconds
  }

  getVoiceById(voiceId) {
    // Search in both male and female voices
    for (const gender in this.voices) {
      if (this.voices[gender][voiceId]) {
        return { ...this.voices[gender][voiceId], id: voiceId, gender };
      }
    }
    return null;
  }

  async getAvailableVoices() {
    const availableVoices = [];

    // Add all configured voices
    for (const gender in this.voices) {
      for (const voiceId in this.voices[gender]) {
        const voice = this.voices[gender][voiceId];
        availableVoices.push({
          id: voiceId,
          name: voice.name,
          description: voice.description,
          gender: gender,
          language: voice.language,
          style: voice.style,
          available: true
        });
      }
    }

    return availableVoices;
  }

  async adjustVoiceSettings(voiceId, settings) {
    try {
      const voice = this.getVoiceById(voiceId);
      if (!voice) {
        throw new Error(`Voice ${voiceId} not found`);
      }

      // Apply custom settings
      const adjustedVoice = {
        ...voice,
        pitch: settings.pitch !== undefined ? settings.pitch : voice.pitch,
        speed: settings.speed !== undefined ? settings.speed : voice.speed
      };

      return adjustedVoice;
    } catch (error) {
      console.error('Voice adjustment error:', error);
      throw error;
    }
  }

  async generateSSML(text, voiceId, emotions = {}) {
    try {
      const voice = this.getVoiceById(voiceId);
      if (!voice) {
        throw new Error(`Voice ${voiceId} not found`);
      }

      // Generate SSML with emotional markup
      let ssml = `<speak version="1.0" xml:lang="${voice.language}">`;
      
      // Add prosody controls
      ssml += `<prosody pitch="${voice.pitch}st" rate="${voice.speed}">`;
      
      // Add emotional emphasis if specified
      if (emotions.emphasis) {
        ssml += `<emphasis level="${emotions.emphasis}">`;
      }
      
      if (emotions.volume) {
        ssml += `<prosody volume="${emotions.volume}">`;
      }

      ssml += text;

      // Close tags
      if (emotions.volume) ssml += '</prosody>';
      if (emotions.emphasis) ssml += '</emphasis>';
      ssml += '</prosody></speak>';

      return ssml;
    } catch (error) {
      console.error('SSML generation error:', error);
      throw error;
    }
  }
}

module.exports = new TextToSpeechService();