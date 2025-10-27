const { Translate } = require('@google-cloud/translate').v2;
const axios = require('axios');

class TranslationService {
  constructor() {
    // Initialize Google Cloud Translate (fallback to other services if not available)
    try {
      this.googleTranslate = new Translate();
      this.hasGoogleTranslate = true;
    } catch (error) {
      console.warn('Google Translate not available, using fallback translation services');
      this.hasGoogleTranslate = false;
    }

    // Supported languages with their codes and names
    this.supportedLanguages = {
      'af': { name: 'Afrikaans', nativeName: 'Afrikaans', region: 'Africa' },
      'sq': { name: 'Albanian', nativeName: 'Shqip', region: 'Europe' },
      'am': { name: 'Amharic', nativeName: 'አማርኛ', region: 'Africa' },
      'ar': { name: 'Arabic', nativeName: 'العربية', region: 'Middle East' },
      'hy': { name: 'Armenian', nativeName: 'Հայերեն', region: 'Asia' },
      'az': { name: 'Azerbaijani', nativeName: 'Azərbaycan', region: 'Asia' },
      'eu': { name: 'Basque', nativeName: 'Euskera', region: 'Europe' },
      'be': { name: 'Belarusian', nativeName: 'Беларуская', region: 'Europe' },
      'bn': { name: 'Bengali', nativeName: 'বাংলা', region: 'Asia' },
      'bs': { name: 'Bosnian', nativeName: 'Bosanski', region: 'Europe' },
      'bg': { name: 'Bulgarian', nativeName: 'Български', region: 'Europe' },
      'ca': { name: 'Catalan', nativeName: 'Català', region: 'Europe' },
      'ceb': { name: 'Cebuano', nativeName: 'Cebuano', region: 'Asia' },
      'zh-CN': { name: 'Chinese (Simplified)', nativeName: '中文(简体)', region: 'Asia' },
      'zh-TW': { name: 'Chinese (Traditional)', nativeName: '中文(繁體)', region: 'Asia' },
      'co': { name: 'Corsican', nativeName: 'Corsu', region: 'Europe' },
      'hr': { name: 'Croatian', nativeName: 'Hrvatski', region: 'Europe' },
      'cs': { name: 'Czech', nativeName: 'Čeština', region: 'Europe' },
      'da': { name: 'Danish', nativeName: 'Dansk', region: 'Europe' },
      'nl': { name: 'Dutch', nativeName: 'Nederlands', region: 'Europe' },
      'en': { name: 'English', nativeName: 'English', region: 'Global' },
      'eo': { name: 'Esperanto', nativeName: 'Esperanto', region: 'Constructed' },
      'et': { name: 'Estonian', nativeName: 'Eesti', region: 'Europe' },
      'fi': { name: 'Finnish', nativeName: 'Suomi', region: 'Europe' },
      'fr': { name: 'French', nativeName: 'Français', region: 'Europe' },
      'fy': { name: 'Frisian', nativeName: 'Frysk', region: 'Europe' },
      'gl': { name: 'Galician', nativeName: 'Galego', region: 'Europe' },
      'ka': { name: 'Georgian', nativeName: 'ქართული', region: 'Asia' },
      'de': { name: 'German', nativeName: 'Deutsch', region: 'Europe' },
      'el': { name: 'Greek', nativeName: 'Ελληνικά', region: 'Europe' },
      'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Asia' },
      'ht': { name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', region: 'Americas' },
      'ha': { name: 'Hausa', nativeName: 'Hausa', region: 'Africa' },
      'haw': { name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', region: 'Oceania' },
      'he': { name: 'Hebrew', nativeName: 'עברית', region: 'Middle East' },
      'hi': { name: 'Hindi', nativeName: 'हिन्दी', region: 'Asia' },
      'hmn': { name: 'Hmong', nativeName: 'Hmoob', region: 'Asia' },
      'hu': { name: 'Hungarian', nativeName: 'Magyar', region: 'Europe' },
      'is': { name: 'Icelandic', nativeName: 'Íslenska', region: 'Europe' },
      'ig': { name: 'Igbo', nativeName: 'Igbo', region: 'Africa' },
      'id': { name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Asia' },
      'ga': { name: 'Irish', nativeName: 'Gaeilge', region: 'Europe' },
      'it': { name: 'Italian', nativeName: 'Italiano', region: 'Europe' },
      'ja': { name: 'Japanese', nativeName: '日本語', region: 'Asia' },
      'jw': { name: 'Javanese', nativeName: 'Basa Jawa', region: 'Asia' },
      'kn': { name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Asia' },
      'kk': { name: 'Kazakh', nativeName: 'Қазақ Тілі', region: 'Asia' },
      'km': { name: 'Khmer', nativeName: 'ភាសាខ្មែរ', region: 'Asia' },
      'rw': { name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', region: 'Africa' },
      'ko': { name: 'Korean', nativeName: '한국어', region: 'Asia' },
      'ku': { name: 'Kurdish', nativeName: 'Kurdî', region: 'Middle East' },
      'ky': { name: 'Kyrgyz', nativeName: 'Кыргызча', region: 'Asia' },
      'lo': { name: 'Lao', nativeName: 'ລາວ', region: 'Asia' },
      'la': { name: 'Latin', nativeName: 'Latinum', region: 'Historical' },
      'lv': { name: 'Latvian', nativeName: 'Latviešu', region: 'Europe' },
      'lt': { name: 'Lithuanian', nativeName: 'Lietuvių', region: 'Europe' },
      'lb': { name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', region: 'Europe' },
      'mk': { name: 'Macedonian', nativeName: 'Македонски', region: 'Europe' },
      'mg': { name: 'Malagasy', nativeName: 'Malagasy', region: 'Africa' },
      'ms': { name: 'Malay', nativeName: 'Bahasa Melayu', region: 'Asia' },
      'ml': { name: 'Malayalam', nativeName: 'മലയാളം', region: 'Asia' },
      'mt': { name: 'Maltese', nativeName: 'Malti', region: 'Europe' },
      'mi': { name: 'Maori', nativeName: 'Te Reo Māori', region: 'Oceania' },
      'mr': { name: 'Marathi', nativeName: 'मराठी', region: 'Asia' },
      'mn': { name: 'Mongolian', nativeName: 'Монгол', region: 'Asia' },
      'my': { name: 'Myanmar (Burmese)', nativeName: 'မြန်မာ', region: 'Asia' },
      'ne': { name: 'Nepali', nativeName: 'नेपाली', region: 'Asia' },
      'no': { name: 'Norwegian', nativeName: 'Norsk', region: 'Europe' },
      'ny': { name: 'Nyanja (Chichewa)', nativeName: 'Chinyanja', region: 'Africa' },
      'or': { name: 'Odia (Oriya)', nativeName: 'ଓଡ଼ିଆ', region: 'Asia' },
      'ps': { name: 'Pashto', nativeName: 'پښتو', region: 'Asia' },
      'fa': { name: 'Persian', nativeName: 'فارسی', region: 'Middle East' },
      'pl': { name: 'Polish', nativeName: 'Polski', region: 'Europe' },
      'pt': { name: 'Portuguese', nativeName: 'Português', region: 'Global' },
      'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Asia' },
      'ro': { name: 'Romanian', nativeName: 'Română', region: 'Europe' },
      'ru': { name: 'Russian', nativeName: 'Русский', region: 'Global' },
      'sm': { name: 'Samoan', nativeName: 'Gagana Samoa', region: 'Oceania' },
      'gd': { name: 'Scots Gaelic', nativeName: 'Gàidhlig', region: 'Europe' },
      'sr': { name: 'Serbian', nativeName: 'Српски', region: 'Europe' },
      'st': { name: 'Sesotho', nativeName: 'Sesotho', region: 'Africa' },
      'sn': { name: 'Shona', nativeName: 'ChiShona', region: 'Africa' },
      'sd': { name: 'Sindhi', nativeName: 'سنڌي', region: 'Asia' },
      'si': { name: 'Sinhala', nativeName: 'සිංහල', region: 'Asia' },
      'sk': { name: 'Slovak', nativeName: 'Slovenčina', region: 'Europe' },
      'sl': { name: 'Slovenian', nativeName: 'Slovenščina', region: 'Europe' },
      'so': { name: 'Somali', nativeName: 'Soomaali', region: 'Africa' },
      'es': { name: 'Spanish', nativeName: 'Español', region: 'Global' },
      'su': { name: 'Sundanese', nativeName: 'Basa Sunda', region: 'Asia' },
      'sw': { name: 'Swahili', nativeName: 'Kiswahili', region: 'Africa' },
      'sv': { name: 'Swedish', nativeName: 'Svenska', region: 'Europe' },
      'tl': { name: 'Tagalog (Filipino)', nativeName: 'Tagalog', region: 'Asia' },
      'tg': { name: 'Tajik', nativeName: 'Тоҷикӣ', region: 'Asia' },
      'ta': { name: 'Tamil', nativeName: 'தமிழ்', region: 'Asia' },
      'tt': { name: 'Tatar', nativeName: 'Татарча', region: 'Asia' },
      'te': { name: 'Telugu', nativeName: 'తెలుగు', region: 'Asia' },
      'th': { name: 'Thai', nativeName: 'ไทย', region: 'Asia' },
      'tr': { name: 'Turkish', nativeName: 'Türkçe', region: 'Asia' },
      'tk': { name: 'Turkmen', nativeName: 'Türkmen', region: 'Asia' },
      'uk': { name: 'Ukrainian', nativeName: 'Українська', region: 'Europe' },
      'ur': { name: 'Urdu', nativeName: 'اردو', region: 'Asia' },
      'ug': { name: 'Uyghur', nativeName: 'ئۇيغۇرچە', region: 'Asia' },
      'uz': { name: 'Uzbek', nativeName: 'O\'zbek', region: 'Asia' },
      'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Asia' },
      'cy': { name: 'Welsh', nativeName: 'Cymraeg', region: 'Europe' },
      'xh': { name: 'Xhosa', nativeName: 'isiXhosa', region: 'Africa' },
      'yi': { name: 'Yiddish', nativeName: 'ייִדיש', region: 'Historical' },
      'yo': { name: 'Yoruba', nativeName: 'Yorùbá', region: 'Africa' },
      'zu': { name: 'Zulu', nativeName: 'isiZulu', region: 'Africa' }
    };

    // Popular language groups for UI organization
    this.languageGroups = {
      'most-popular': ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh-CN', 'ja', 'ko', 'ar', 'hi'],
      'european': ['en', 'fr', 'de', 'it', 'es', 'pt', 'ru', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 'hu', 'ro', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 'el', 'mt'],
      'asian': ['zh-CN', 'zh-TW', 'ja', 'ko', 'hi', 'bn', 'ta', 'te', 'ml', 'kn', 'gu', 'mr', 'pa', 'ur', 'th', 'vi', 'id', 'ms', 'tl', 'my', 'km', 'lo', 'si', 'ne', 'mn'],
      'african': ['ar', 'sw', 'am', 'ha', 'yo', 'ig', 'zu', 'xh', 'af', 'so', 'rw', 'ny', 'st', 'sn', 'mg'],
      'middle-eastern': ['ar', 'he', 'fa', 'tr', 'ku'],
      'americas': ['en', 'es', 'pt', 'fr', 'ht']
    };
  }

  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      // Validate target language
      if (!this.supportedLanguages[targetLanguage]) {
        throw new Error(`Unsupported target language: ${targetLanguage}`);
      }

      let translatedText = '';
      let detectedSourceLanguage = sourceLanguage;

      if (this.hasGoogleTranslate) {
        const result = await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
        translatedText = result.translatedText;
        detectedSourceLanguage = result.detectedSourceLanguage;
      } else {
        // Fallback to other translation services
        const result = await this.translateWithFallback(text, targetLanguage, sourceLanguage);
        translatedText = result.translatedText;
        detectedSourceLanguage = result.detectedSourceLanguage;
      }

      return {
        originalText: text,
        translatedText,
        sourceLanguage: detectedSourceLanguage,
        targetLanguage,
        confidence: 0.95, // Mock confidence score
        service: this.hasGoogleTranslate ? 'google' : 'fallback',
        translatedAt: new Date()
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Failed to translate text: ${error.message}`);
    }
  }

  async translateWithGoogle(text, targetLanguage, sourceLanguage) {
    try {
      const options = {
        to: targetLanguage
      };

      if (sourceLanguage !== 'auto') {
        options.from = sourceLanguage;
      }

      const [translation, metadata] = await this.googleTranslate.translate(text, options);
      
      return {
        translatedText: Array.isArray(translation) ? translation[0] : translation,
        detectedSourceLanguage: metadata?.data?.translations?.[0]?.detectedSourceLanguage || sourceLanguage
      };
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }

  async translateWithFallback(text, targetLanguage, sourceLanguage) {
    try {
      // Fallback translation using free services or local dictionaries
      // This is a simplified implementation - in production you'd use actual fallback services
      
      // Mock translation for demo purposes
      const mockTranslations = {
        'es': {
          'hello': 'hola',
          'world': 'mundo',
          'how are you': 'cómo estás',
          'good morning': 'buenos días',
          'thank you': 'gracias',
          'goodbye': 'adiós'
        },
        'fr': {
          'hello': 'bonjour',
          'world': 'monde',
          'how are you': 'comment allez-vous',
          'good morning': 'bonjour',
          'thank you': 'merci',
          'goodbye': 'au revoir'
        },
        'de': {
          'hello': 'hallo',
          'world': 'welt',
          'how are you': 'wie geht es dir',
          'good morning': 'guten morgen',
          'thank you': 'danke',
          'goodbye': 'auf wiedersehen'
        },
        'it': {
          'hello': 'ciao',
          'world': 'mondo',
          'how are you': 'come stai',
          'good morning': 'buongiorno',
          'thank you': 'grazie',
          'goodbye': 'arrivederci'
        },
        'pt': {
          'hello': 'olá',
          'world': 'mundo',
          'how are you': 'como você está',
          'good morning': 'bom dia',
          'thank you': 'obrigado',
          'goodbye': 'tchau'
        },
        'ru': {
          'hello': 'привет',
          'world': 'мир',
          'how are you': 'как дела',
          'good morning': 'доброе утро',
          'thank you': 'спасибо',
          'goodbye': 'до свидания'
        },
        'zh-CN': {
          'hello': '你好',
          'world': '世界',
          'how are you': '你好吗',
          'good morning': '早上好',
          'thank you': '谢谢',
          'goodbye': '再见'
        },
        'ja': {
          'hello': 'こんにちは',
          'world': '世界',
          'how are you': '元気ですか',
          'good morning': 'おはようございます',
          'thank you': 'ありがとう',
          'goodbye': 'さようなら'
        },
        'ko': {
          'hello': '안녕하세요',
          'world': '세계',
          'how are you': '어떻게 지내세요',
          'good morning': '좋은 아침',
          'thank you': '감사합니다',
          'goodbye': '안녕히 가세요'
        },
        'ar': {
          'hello': 'مرحبا',
          'world': 'عالم',
          'how are you': 'كيف حالك',
          'good morning': 'صباح الخير',
          'thank you': 'شكرا لك',
          'goodbye': 'وداعا'
        },
        'hi': {
          'hello': 'नमस्ते',
          'world': 'दुनिया',
          'how are you': 'आप कैसे हैं',
          'good morning': 'सुप्रभात',
          'thank you': 'धन्यवाद',
          'goodbye': 'अलविदा'
        }
      };

      const lowerText = text.toLowerCase().trim();
      const targetDict = mockTranslations[targetLanguage];
      
      if (targetDict && targetDict[lowerText]) {
        return {
          translatedText: targetDict[lowerText],
          detectedSourceLanguage: 'en'
        };
      }

      // If no direct translation found, return a modified version indicating translation attempt
      return {
        translatedText: `[${targetLanguage.toUpperCase()}] ${text}`,
        detectedSourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage
      };
    } catch (error) {
      console.error('Fallback translation error:', error);
      throw error;
    }
  }

  async detectLanguage(text) {
    try {
      if (this.hasGoogleTranslate) {
        const [detections] = await this.googleTranslate.detect(text);
        const detection = Array.isArray(detections) ? detections[0] : detections;
        
        return {
          language: detection.language,
          confidence: detection.confidence,
          languageInfo: this.supportedLanguages[detection.language] || { name: 'Unknown' }
        };
      } else {
        // Fallback language detection (simplified)
        return this.detectLanguageFallback(text);
      }
    } catch (error) {
      console.error('Language detection error:', error);
      return {
        language: 'en',
        confidence: 0.5,
        languageInfo: this.supportedLanguages['en']
      };
    }
  }

  detectLanguageFallback(text) {
    // Simple language detection based on character patterns
    const patterns = {
      'zh-CN': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'ar': /[\u0600-\u06ff]/,
      'ru': /[\u0400-\u04ff]/,
      'th': /[\u0e00-\u0e7f]/,
      'hi': /[\u0900-\u097f]/,
      'he': /[\u0590-\u05ff]/,
      'el': /[\u0370-\u03ff]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return {
          language: lang,
          confidence: 0.8,
          languageInfo: this.supportedLanguages[lang]
        };
      }
    }

    // Default to English if no pattern matches
    return {
      language: 'en',
      confidence: 0.6,
      languageInfo: this.supportedLanguages['en']
    };
  }

  async translateBatch(texts, targetLanguage, sourceLanguage = 'auto') {
    try {
      const translations = await Promise.all(
        texts.map(text => this.translateText(text, targetLanguage, sourceLanguage))
      );

      return {
        translations,
        totalTexts: texts.length,
        targetLanguage,
        sourceLanguage,
        batchTranslatedAt: new Date()
      };
    } catch (error) {
      console.error('Batch translation error:', error);
      throw new Error(`Failed to translate batch: ${error.message}`);
    }
  }

  async getSupportedLanguages() {
    return {
      languages: this.supportedLanguages,
      groups: this.languageGroups,
      totalLanguages: Object.keys(this.supportedLanguages).length,
      hasCloudTranslation: this.hasGoogleTranslate
    };
  }

  getLanguagesByRegion(region) {
    const languages = {};
    
    for (const [code, info] of Object.entries(this.supportedLanguages)) {
      if (info.region.toLowerCase().includes(region.toLowerCase())) {
        languages[code] = info;
      }
    }

    return languages;
  }

  getPopularLanguages() {
    const popular = {};
    
    for (const code of this.languageGroups['most-popular']) {
      if (this.supportedLanguages[code]) {
        popular[code] = this.supportedLanguages[code];
      }
    }

    return popular;
  }

  async getTranslationQuality(originalText, translatedText, targetLanguage) {
    try {
      // Simple quality assessment based on length and character variety
      const lengthRatio = translatedText.length / originalText.length;
      const hasSpecialChars = /[^\w\s]/.test(translatedText);
      const hasTargetLangChars = this.hasLanguageSpecificCharacters(translatedText, targetLanguage);

      let qualityScore = 0.7; // Base score

      // Adjust based on length ratio (should be reasonable)
      if (lengthRatio >= 0.5 && lengthRatio <= 2.0) {
        qualityScore += 0.1;
      }

      // Bonus for having language-specific characters
      if (hasTargetLangChars) {
        qualityScore += 0.15;
      }

      // Bonus for preserving punctuation
      if (hasSpecialChars) {
        qualityScore += 0.05;
      }

      return {
        score: Math.min(qualityScore, 1.0),
        lengthRatio,
        hasLanguageSpecificCharacters: hasTargetLangChars,
        assessedAt: new Date()
      };
    } catch (error) {
      console.error('Quality assessment error:', error);
      return { score: 0.5, error: error.message };
    }
  }

  hasLanguageSpecificCharacters(text, languageCode) {
    const languagePatterns = {
      'zh-CN': /[\u4e00-\u9fff]/,
      'zh-TW': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/,
      'ko': /[\uac00-\ud7af]/,
      'ar': /[\u0600-\u06ff]/,
      'ru': /[\u0400-\u04ff]/,
      'th': /[\u0e00-\u0e7f]/,
      'hi': /[\u0900-\u097f]/,
      'he': /[\u0590-\u05ff]/,
      'el': /[\u0370-\u03ff]/,
      'bg': /[\u0400-\u04ff]/,
      'mk': /[\u0400-\u04ff]/,
      'sr': /[\u0400-\u04ff]/,
      'uk': /[\u0400-\u04ff]/,
      'be': /[\u0400-\u04ff]/
    };

    const pattern = languagePatterns[languageCode];
    return pattern ? pattern.test(text) : false;
  }

  async cacheTranslation(originalText, translatedText, sourceLanguage, targetLanguage) {
    // In production, you'd implement proper caching (Redis, database, etc.)
    // For now, this is a placeholder for the caching mechanism
    const cacheKey = `${sourceLanguage}-${targetLanguage}-${Buffer.from(originalText).toString('base64').substring(0, 20)}`;
    
    return {
      cached: true,
      cacheKey,
      cachedAt: new Date()
    };
  }
}

module.exports = new TranslationService();