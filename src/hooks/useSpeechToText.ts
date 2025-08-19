import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent, 
  SpeechToTextConfig, 
  SessionMetadata,
  AudioMetrics,
  ChartData,
  PerformanceMode
} from '../types/speechToText';
import { useAudioAnalysis } from './useAudioAnalysis';
import { generateSessionMetadata, generateChartData } from '../utils/speechToTextUtils';

interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  silenceDetected: boolean;
  sessionMetadata: SessionMetadata | null;
  audioMetrics: AudioMetrics;
  chartData: ChartData;
  toggleListening: () => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  clearTranscript: () => void;
  copyMetadataToClipboard: () => Promise<{ success: boolean; message: string }>;
}

export const useSpeechToText = (config: SpeechToTextConfig = {}): UseSpeechToTextReturn => {
  const {
    language = 'es-ES',
    silenceTimeout = 700,
    optimizedMode = true,
    performanceMode = PerformanceMode.BALANCED,
    audioConfig = {}
  } = config;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [silenceDetected, setSilenceDetected] = useState(false);
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata | null>(null);
  const [, forceUpdate] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const currentWordsRef = useRef<string[]>([]);
  const uiUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    initializeAudioAnalysis,
    stopAudioAnalysis,
    getAudioData,
    clearAudioData,
    getSessionStartTime,
    volumeDataRef,
    pitchDataRef,
    spectralCentroidDataRef
  } = useAudioAnalysis(performanceMode);

  // Get current audio metrics (not memoized to allow real-time updates)
  const audioMetrics = getAudioData();
  
  // Memoized chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => generateChartData(
    audioMetrics.volumeData,
    audioMetrics.pitchData,
    sessionMetadata || undefined
  ), [audioMetrics.volumeData, audioMetrics.pitchData, sessionMetadata]);

  // Memoized metadata generation function
  const generateMetadata = useCallback(() => {
    return generateSessionMetadata(
      currentWordsRef.current,
      getSessionStartTime(),
      volumeDataRef.current,
      pitchDataRef.current,
      spectralCentroidDataRef.current
    );
  }, [getSessionStartTime, volumeDataRef, pitchDataRef, spectralCentroidDataRef]);

  // Optimized word processing with regex caching
  const wordSplitRegex = useMemo(() => /\s+/, []);
  
  const processTranscript = useCallback((finalTranscript: string, interimTranscript: string) => {
    if (finalTranscript || interimTranscript) {
      lastSpeechTimeRef.current = Date.now();
      setSilenceDetected(false);
      
      // Clear existing timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      // Set new silence timer
      silenceTimerRef.current = setTimeout(() => {
        setSilenceDetected(true);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          
          // Clear UI update interval
          if (uiUpdateIntervalRef.current) {
            clearInterval(uiUpdateIntervalRef.current);
            uiUpdateIntervalRef.current = null;
          }
          
          // Delayed metadata generation to capture final audio
          setTimeout(() => {
            stopAudioAnalysis();
            setSessionMetadata(generateMetadata());
          }, 200);
        }
      }, silenceTimeout);
    }

    if (finalTranscript) {
      setTranscript(prev => prev + finalTranscript);
      // Optimized word extraction
      const newWords = finalTranscript.trim().split(wordSplitRegex).filter(Boolean);
      if (newWords.length > 0) {
        currentWordsRef.current.push(...newWords);
      }
    }
    
    setInterimTranscript(interimTranscript);
  }, [silenceTimeout, stopAudioAnalysis, generateMetadata, wordSplitRegex]);

  // Initialize speech recognition with optimized configuration
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return;
    
    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Configure recognition settings
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = optimizedMode ? 1 : 3;
    
    // Optional service URI optimization
    if (optimizedMode && 'serviceURI' in recognition) {
      recognition.serviceURI = '';
    }

    // Optimized result handler with minimal processing
    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process only new results starting from resultIndex
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      processTranscript(finalTranscript, interimTranscript);
    };

    // Event handlers with error boundaries
    const handleStart = () => setIsListening(true);
    
    const handleEnd = () => {
      setIsListening(false);
      setInterimTranscript('');
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      if (uiUpdateIntervalRef.current) {
        clearInterval(uiUpdateIntervalRef.current);
        uiUpdateIntervalRef.current = null;
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimTranscript('');
      
      if (uiUpdateIntervalRef.current) {
        clearInterval(uiUpdateIntervalRef.current);
        uiUpdateIntervalRef.current = null;
      }
    };

    // Attach event listeners
    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('start', handleStart);
    recognition.addEventListener('end', handleEnd);
    recognition.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (uiUpdateIntervalRef.current) {
        clearInterval(uiUpdateIntervalRef.current);
        uiUpdateIntervalRef.current = null;
      }
      stopAudioAnalysis();
    };
  }, [language, optimizedMode, processTranscript, stopAudioAnalysis]);

  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      // Stop listening
      recognitionRef.current.stop();
      
      // Clear UI update interval
      if (uiUpdateIntervalRef.current) {
        clearInterval(uiUpdateIntervalRef.current);
        uiUpdateIntervalRef.current = null;
      }
      
      setTimeout(() => {
        stopAudioAnalysis();
        setSessionMetadata(generateMetadata());
      }, 100);
    } else {
      // Start listening
      setSilenceDetected(false);
      setSessionMetadata(null);
      currentWordsRef.current.length = 0; // Efficient array clearing
      lastSpeechTimeRef.current = Date.now();
      
      try {
        await initializeAudioAnalysis(audioConfig);
        recognitionRef.current.start();
        
        // Start UI update interval for real-time metrics display
        uiUpdateIntervalRef.current = setInterval(() => {
          if (isListening) {
            forceUpdate(prev => prev + 1);
          }
        }, 100); // Update UI every 100ms
        
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        // Reset state on error
        setIsListening(false);
        setSilenceDetected(false);
      }
    }
  }, [isListening, stopAudioAnalysis, generateMetadata, initializeAudioAnalysis, audioConfig]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    setSilenceDetected(false);
    setSessionMetadata(null);
    currentWordsRef.current.length = 0;
    lastSpeechTimeRef.current = Date.now();
    
    try {
      await initializeAudioAnalysis(audioConfig);
      recognitionRef.current.start();
      
      uiUpdateIntervalRef.current = setInterval(() => {
        if (isListening) {
          forceUpdate(prev => prev + 1);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      setSilenceDetected(false);
    }
  }, [isListening, initializeAudioAnalysis, audioConfig]);

  const stopListening = useCallback(async () => {
    if (!recognitionRef.current || !isListening) return;

    recognitionRef.current.stop();
    
    if (uiUpdateIntervalRef.current) {
      clearInterval(uiUpdateIntervalRef.current);
      uiUpdateIntervalRef.current = null;
    }
    
    setTimeout(() => {
      stopAudioAnalysis();
      setSessionMetadata(generateMetadata());
    }, 100);
  }, [isListening, stopAudioAnalysis, generateMetadata]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setSilenceDetected(false);
    setSessionMetadata(null);
    currentWordsRef.current.length = 0; // Efficient array clearing
    
    // Clear UI update interval if running
    if (uiUpdateIntervalRef.current) {
      clearInterval(uiUpdateIntervalRef.current);
      uiUpdateIntervalRef.current = null;
    }
    
    clearAudioData();
  }, [clearAudioData]);

  // Optimized clipboard operation with better error handling
  const copyMetadataToClipboard = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!sessionMetadata) {
      return { success: false, message: 'No metadata available' };
    }
    
    try {
      const jsonString = JSON.stringify(sessionMetadata, null, 2);
      await navigator.clipboard.writeText(jsonString);
      return { success: true, message: 'Copied!' };
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      return { success: false, message: 'Copy failed' };
    }
  }, [sessionMetadata]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    silenceDetected,
    sessionMetadata,
    audioMetrics,
    chartData,
    toggleListening,
    startListening,
    stopListening,
    clearTranscript,
    copyMetadataToClipboard
  };
};