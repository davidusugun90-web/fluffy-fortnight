import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  // Photo data
  uploadedPhoto: null,
  processedPhoto: null,
  
  // Audio data
  generatedAudio: null,
  selectedVoice: null,
  
  // Animation settings
  animationType: 'natural',
  animationIntensity: 0.6,
  
  // Background settings
  backgroundType: 'none',
  backgroundImage: null,
  
  // Video settings
  videoQuality: '4k',
  videoDuration: 30,
  maxDuration: 300,
  
  // Translation settings
  sourceLanguage: 'auto',
  targetLanguage: 'en',
  
  // Processing state
  isProcessing: false,
  processingStage: '',
  processingProgress: 0,
  
  // Generated content
  lipSyncData: null,
  animationData: null,
  generatedVideo: null,
  
  // UI state
  currentStep: 1,
  totalSteps: 4,
  
  // Session data
  sessionId: null,
  projectName: '',
};

// Action types
export const ActionTypes = {
  // Photo actions
  SET_UPLOADED_PHOTO: 'SET_UPLOADED_PHOTO',
  SET_PROCESSED_PHOTO: 'SET_PROCESSED_PHOTO',
  
  // Audio actions
  SET_GENERATED_AUDIO: 'SET_GENERATED_AUDIO',
  SET_SELECTED_VOICE: 'SET_SELECTED_VOICE',
  
  // Animation actions
  SET_ANIMATION_TYPE: 'SET_ANIMATION_TYPE',
  SET_ANIMATION_INTENSITY: 'SET_ANIMATION_INTENSITY',
  
  // Background actions
  SET_BACKGROUND_TYPE: 'SET_BACKGROUND_TYPE',
  SET_BACKGROUND_IMAGE: 'SET_BACKGROUND_IMAGE',
  
  // Video actions
  SET_VIDEO_QUALITY: 'SET_VIDEO_QUALITY',
  SET_VIDEO_DURATION: 'SET_VIDEO_DURATION',
  
  // Translation actions
  SET_SOURCE_LANGUAGE: 'SET_SOURCE_LANGUAGE',
  SET_TARGET_LANGUAGE: 'SET_TARGET_LANGUAGE',
  
  // Processing actions
  SET_PROCESSING: 'SET_PROCESSING',
  SET_PROCESSING_STAGE: 'SET_PROCESSING_STAGE',
  SET_PROCESSING_PROGRESS: 'SET_PROCESSING_PROGRESS',
  
  // Generated content actions
  SET_LIP_SYNC_DATA: 'SET_LIP_SYNC_DATA',
  SET_ANIMATION_DATA: 'SET_ANIMATION_DATA',
  SET_GENERATED_VIDEO: 'SET_GENERATED_VIDEO',
  
  // UI actions
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREVIOUS_STEP: 'PREVIOUS_STEP',
  
  // Session actions
  SET_SESSION_ID: 'SET_SESSION_ID',
  SET_PROJECT_NAME: 'SET_PROJECT_NAME',
  
  // Utility actions
  RESET_STATE: 'RESET_STATE',
  RESET_PROCESSING: 'RESET_PROCESSING',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_UPLOADED_PHOTO:
      return {
        ...state,
        uploadedPhoto: action.payload,
        sessionId: action.payload?.sessionId || state.sessionId,
      };
      
    case ActionTypes.SET_PROCESSED_PHOTO:
      return {
        ...state,
        processedPhoto: action.payload,
      };
      
    case ActionTypes.SET_GENERATED_AUDIO:
      return {
        ...state,
        generatedAudio: action.payload,
      };
      
    case ActionTypes.SET_SELECTED_VOICE:
      return {
        ...state,
        selectedVoice: action.payload,
      };
      
    case ActionTypes.SET_ANIMATION_TYPE:
      return {
        ...state,
        animationType: action.payload,
      };
      
    case ActionTypes.SET_ANIMATION_INTENSITY:
      return {
        ...state,
        animationIntensity: action.payload,
      };
      
    case ActionTypes.SET_BACKGROUND_TYPE:
      return {
        ...state,
        backgroundType: action.payload,
      };
      
    case ActionTypes.SET_BACKGROUND_IMAGE:
      return {
        ...state,
        backgroundImage: action.payload,
      };
      
    case ActionTypes.SET_VIDEO_QUALITY:
      return {
        ...state,
        videoQuality: action.payload,
      };
      
    case ActionTypes.SET_VIDEO_DURATION:
      return {
        ...state,
        videoDuration: Math.min(action.payload, state.maxDuration),
      };
      
    case ActionTypes.SET_SOURCE_LANGUAGE:
      return {
        ...state,
        sourceLanguage: action.payload,
      };
      
    case ActionTypes.SET_TARGET_LANGUAGE:
      return {
        ...state,
        targetLanguage: action.payload,
      };
      
    case ActionTypes.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.payload,
      };
      
    case ActionTypes.SET_PROCESSING_STAGE:
      return {
        ...state,
        processingStage: action.payload,
      };
      
    case ActionTypes.SET_PROCESSING_PROGRESS:
      return {
        ...state,
        processingProgress: action.payload,
      };
      
    case ActionTypes.SET_LIP_SYNC_DATA:
      return {
        ...state,
        lipSyncData: action.payload,
      };
      
    case ActionTypes.SET_ANIMATION_DATA:
      return {
        ...state,
        animationData: action.payload,
      };
      
    case ActionTypes.SET_GENERATED_VIDEO:
      return {
        ...state,
        generatedVideo: action.payload,
      };
      
    case ActionTypes.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: Math.max(1, Math.min(action.payload, state.totalSteps)),
      };
      
    case ActionTypes.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      };
      
    case ActionTypes.PREVIOUS_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
      
    case ActionTypes.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.payload,
      };
      
    case ActionTypes.SET_PROJECT_NAME:
      return {
        ...state,
        projectName: action.payload,
      };
      
    case ActionTypes.RESET_PROCESSING:
      return {
        ...state,
        isProcessing: false,
        processingStage: '',
        processingProgress: 0,
      };
      
    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        // Preserve some settings
        videoQuality: state.videoQuality,
        animationType: state.animationType,
        animationIntensity: state.animationIntensity,
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Action creators
  const actions = {
    // Photo actions
    setUploadedPhoto: (photo) => dispatch({ type: ActionTypes.SET_UPLOADED_PHOTO, payload: photo }),
    setProcessedPhoto: (photo) => dispatch({ type: ActionTypes.SET_PROCESSED_PHOTO, payload: photo }),
    
    // Audio actions
    setGeneratedAudio: (audio) => dispatch({ type: ActionTypes.SET_GENERATED_AUDIO, payload: audio }),
    setSelectedVoice: (voice) => dispatch({ type: ActionTypes.SET_SELECTED_VOICE, payload: voice }),
    
    // Animation actions
    setAnimationType: (type) => dispatch({ type: ActionTypes.SET_ANIMATION_TYPE, payload: type }),
    setAnimationIntensity: (intensity) => dispatch({ type: ActionTypes.SET_ANIMATION_INTENSITY, payload: intensity }),
    
    // Background actions
    setBackgroundType: (type) => dispatch({ type: ActionTypes.SET_BACKGROUND_TYPE, payload: type }),
    setBackgroundImage: (image) => dispatch({ type: ActionTypes.SET_BACKGROUND_IMAGE, payload: image }),
    
    // Video actions
    setVideoQuality: (quality) => dispatch({ type: ActionTypes.SET_VIDEO_QUALITY, payload: quality }),
    setVideoDuration: (duration) => dispatch({ type: ActionTypes.SET_VIDEO_DURATION, payload: duration }),
    
    // Translation actions
    setSourceLanguage: (language) => dispatch({ type: ActionTypes.SET_SOURCE_LANGUAGE, payload: language }),
    setTargetLanguage: (language) => dispatch({ type: ActionTypes.SET_TARGET_LANGUAGE, payload: language }),
    
    // Processing actions
    setProcessing: (isProcessing) => dispatch({ type: ActionTypes.SET_PROCESSING, payload: isProcessing }),
    setProcessingStage: (stage) => dispatch({ type: ActionTypes.SET_PROCESSING_STAGE, payload: stage }),
    setProcessingProgress: (progress) => dispatch({ type: ActionTypes.SET_PROCESSING_PROGRESS, payload: progress }),
    
    // Generated content actions
    setLipSyncData: (data) => dispatch({ type: ActionTypes.SET_LIP_SYNC_DATA, payload: data }),
    setAnimationData: (data) => dispatch({ type: ActionTypes.SET_ANIMATION_DATA, payload: data }),
    setGeneratedVideo: (video) => dispatch({ type: ActionTypes.SET_GENERATED_VIDEO, payload: video }),
    
    // UI actions
    setCurrentStep: (step) => dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step }),
    nextStep: () => dispatch({ type: ActionTypes.NEXT_STEP }),
    previousStep: () => dispatch({ type: ActionTypes.PREVIOUS_STEP }),
    
    // Session actions
    setSessionId: (id) => dispatch({ type: ActionTypes.SET_SESSION_ID, payload: id }),
    setProjectName: (name) => dispatch({ type: ActionTypes.SET_PROJECT_NAME, payload: name }),
    
    // Utility actions
    resetState: () => dispatch({ type: ActionTypes.RESET_STATE }),
    resetProcessing: () => dispatch({ type: ActionTypes.RESET_PROCESSING }),
  };
  
  // Computed values
  const computed = {
    canProceedToNextStep: () => {
      switch (state.currentStep) {
        case 1: // Photo upload step
          return state.uploadedPhoto !== null;
        case 2: // Text-to-speech step
          return state.generatedAudio !== null;
        case 3: // Settings step
          return true; // Always can proceed from settings
        case 4: // Video generation step
          return state.generatedVideo !== null;
        default:
          return false;
      }
    },
    
    getStepTitle: (step) => {
      const titles = {
        1: 'Upload Photo',
        2: 'Add Voice',
        3: 'Customize',
        4: 'Generate Video'
      };
      return titles[step] || '';
    },
    
    getProcessingPercentage: () => {
      return Math.round(state.processingProgress);
    },
    
    isStepCompleted: (step) => {
      switch (step) {
        case 1:
          return state.uploadedPhoto !== null;
        case 2:
          return state.generatedAudio !== null;
        case 3:
          return true; // Settings step is always considered completed once visited
        case 4:
          return state.generatedVideo !== null;
        default:
          return false;
      }
    },
  };
  
  const value = {
    state,
    actions,
    computed,
    dispatch, // For advanced usage
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};