import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAppContext } from './AppContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { actions } = useAppContext();

  useEffect(() => {
    // Initialize socket connection
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 Reconnected to server after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔌 Reconnection error:', error);
    });

    // Processing update handlers
    socket.on('processing-update', (data) => {
      const { stage, progress, message } = data;
      
      actions.setProcessingStage(stage);
      actions.setProcessingProgress(progress);
      
      console.log(`📊 Processing update: ${stage} - ${progress}% - ${message}`);
    });

    // Photo processing events
    socket.on('photo-processed', (data) => {
      console.log('📸 Photo processed:', data);
      actions.setProcessedPhoto(data);
    });

    // Background processing events
    socket.on('background-removed', (data) => {
      console.log('🖼️ Background removed:', data);
    });

    socket.on('background-replaced', (data) => {
      console.log('🖼️ Background replaced:', data);
      actions.setBackgroundImage(data);
    });

    // TTS events
    socket.on('tts-generated', (data) => {
      console.log('🎤 TTS generated:', data);
      actions.setGeneratedAudio(data);
    });

    // Lip sync events
    socket.on('lip-sync-generated', (data) => {
      console.log('👄 Lip sync generated:', data);
      actions.setLipSyncData(data);
    });

    // Animation events
    socket.on('animation-generated', (data) => {
      console.log('🎭 Animation generated:', data);
      actions.setAnimationData(data);
    });

    // Video generation events
    socket.on('video-generated', (data) => {
      console.log('🎬 Video generated:', data);
      actions.setGeneratedVideo(data);
      actions.setProcessing(false);
    });

    // Error handling
    socket.on('processing-error', (error) => {
      console.error('❌ Processing error:', error);
      actions.setProcessing(false);
      actions.resetProcessing();
    });

    socket.on('server-error', (error) => {
      console.error('❌ Server error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [actions]);

  // Socket utility functions
  const joinSession = (sessionId) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit('join-session', sessionId);
      console.log('🏠 Joined session:', sessionId);
    }
  };

  const leaveSession = (sessionId) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit('leave-session', sessionId);
      console.log('🚪 Left session:', sessionId);
    }
  };

  const emitEvent = (eventName, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, data);
      console.log('📤 Emitted event:', eventName, data);
    } else {
      console.warn('⚠️ Cannot emit event - socket not connected');
    }
  };

  const onEvent = (eventName, handler) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, handler);
    }
  };

  const offEvent = (eventName, handler) => {
    if (socketRef.current) {
      socketRef.current.off(eventName, handler);
    }
  };

  // Connection status checker
  const checkConnection = () => {
    return socketRef.current && socketRef.current.connected;
  };

  // Reconnection helper
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    joinSession,
    leaveSession,
    emitEvent,
    onEvent,
    offEvent,
    checkConnection,
    reconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};