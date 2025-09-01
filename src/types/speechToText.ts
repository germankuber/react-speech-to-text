export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'end', listener: () => void): void;
  addEventListener(type: 'start', listener: () => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

/**
 * Detailed metadata for individual words in speech analysis
 */
export interface WordMetadata {
  /** The transcribed word */
  word: string;
  /** Word start time in milliseconds from session start */
  startTime: number;
  /** Word end time in milliseconds from session start */
  endTime: number;
  /** Volume level (dB) at word start */
  startVolume: number;
  /** Volume level (dB) at word end */
  endVolume: number;
  /** Maximum volume level (dB) during word */
  peakVolume: number;
  /** Minimum volume level (dB) during word */
  minVolume: number;
  /** Average volume level (dB) during word */
  averageVolume: number;
  /** Pitch frequency (Hz) at word start */
  startPitch: number;
  /** Pitch frequency (Hz) at word end */
  endPitch: number;
  /** Maximum pitch frequency (Hz) during word */
  peakPitch: number;
  /** Minimum pitch frequency (Hz) during word */
  minPitch: number;
  /** Average pitch frequency (Hz) during word */
  averagePitch: number;
  /** Spectral centroid (Hz) at word start */
  startSpectralCentroid: number;
  /** Spectral centroid (Hz) at word end */
  endSpectralCentroid: number;
  /** Maximum spectral centroid (Hz) during word */
  peakSpectralCentroid: number;
  /** Minimum spectral centroid (Hz) during word */
  minSpectralCentroid: number;
  /** Average spectral centroid (Hz) during word */
  averageSpectralCentroid: number;
}

/**
 * Complete session metadata containing all speech analysis results
 */
export interface SessionMetadata {
  /** Session start timestamp (milliseconds since epoch) */
  sessionStartTime: number;
  /** Session end timestamp (milliseconds since epoch) */
  sessionEndTime: number;
  /** Total session duration in milliseconds */
  totalDuration: number;
  /** Array of individual word metadata */
  words: WordMetadata[];
  /** Overall session average volume in dB */
  overallAverageVolume: number;
  /** Overall session peak volume in dB */
  overallPeakVolume: number;
  /** Overall session minimum volume in dB */
  overallMinVolume: number;
  /** Overall session average pitch in Hz */
  overallAveragePitch: number;
  /** Overall session peak pitch in Hz */
  overallPeakPitch: number;
  /** Overall session minimum pitch in Hz */
  overallMinPitch: number;
  /** Overall session average spectral centroid in Hz */
  overallAverageSpectralCentroid: number;
  /** Overall session peak spectral centroid in Hz */
  overallPeakSpectralCentroid: number;
  /** Overall session minimum spectral centroid in Hz */
  overallMinSpectralCentroid: number;
}

/**
 * Performance modes for audio analysis optimization
 * - SPEED: Low latency, minimal CPU usage (recommended for real-time speech recognition)
 * - BALANCED: Optimal balance between performance and quality (default)
 * - QUALITY: Maximum accuracy for detailed audio analysis
 */
export enum PerformanceMode {
  SPEED = 'speed',
  BALANCED = 'balanced',
  QUALITY = 'quality'
}

/**
 * Configuration interface for speech-to-text functionality
 */
export interface SpeechToTextConfig {
  /** 
   * Language code for speech recognition (e.g., 'en-US', 'es-ES')
   * @default 'es-ES'
   */
  language?: string;
  
  /** 
   * Timeout in milliseconds to detect silence and stop recording
   * @default 700
   */
  silenceTimeout?: number;
  
  /** 
   * Enable optimized mode for faster recognition with fewer alternatives
   * When true, uses maxAlternatives=1 and disables serviceURI for speed
   * @default true
   */
  optimizedMode?: boolean;
  
  /** 
   * Performance profile that controls audio analysis quality vs speed trade-offs
   * @default PerformanceMode.BALANCED
   */
  performanceMode?: PerformanceMode;
  
  /** 
   * Audio constraints for getUserMedia API to control microphone settings
   */
  audioConfig?: {
    /** 
     * Enable/disable echo cancellation processing
     * @default false (disabled for better pitch detection)
     */
    echoCancellation?: boolean;
    
    /** 
     * Enable/disable noise suppression processing
     * @default false (disabled for accurate audio analysis)
     */
    noiseSuppression?: boolean;
    
    /** 
     * Enable/disable automatic gain control
     * @default false (disabled for consistent volume measurements)
     */
    autoGainControl?: boolean;
  };
  
  /**
   * Callback function triggered when silence is detected
   * Provides detailed information about the silence event and current state
   */
  onSilenceDetected?: (data: SilenceDetectedData) => void;
  
  /**
   * Callback function triggered when speech starts (user begins speaking)
   * Provides detailed information about the speech start event
   */
  onSpeechStart?: (data: SpeechStartData) => void;
  
  /**
   * Callback function triggered when speech ends (user stops speaking)
   * Different from silence detection - this triggers immediately when speech pauses
   */
  onSpeechEnd?: (data: SpeechEndData) => void;
  
  /**
   * Volume threshold (0-100) to detect speech start/end
   * @default 15
   */
  speechVolumeThreshold?: number;
  
  /**
   * Minimum pause duration (milliseconds) to trigger speech end
   * @default 200
   */
  speechPauseThreshold?: number;
  
  /**
   * Callback function triggered when a speech recognition error occurs
   * Provides detailed information about the error for custom handling
   */
  onError?: (data: SpeechErrorData) => void;
}

/**
 * Real-time audio analysis metrics
 */
export interface AudioMetrics {
  /** Current volume level (0-100 scale for UI display) */
  currentVolume: number;
  /** Current pitch frequency in Hz (0 if no pitch detected) */
  currentPitch: number;
  /** Current spectral centroid frequency in Hz (0 if not calculated) */
  currentSpectralCentroid: number;
  /** Time-series volume data with timestamps */
  volumeData: { time: number; volume: number }[];
  /** Time-series pitch data with timestamps */
  pitchData: { time: number; pitch: number }[];
  /** Time-series spectral centroid data with timestamps */
  spectralCentroidData: { time: number; spectralCentroid: number }[];
}

/**
 * Chart-ready data structures for visualization
 */
export interface ChartData {
  /** Averaged volume data bucketed by time intervals */
  volumeData: { time: number; averageVolume: number }[];
  /** Averaged pitch data bucketed by time intervals */
  pitchData: { time: number; averagePitch: number }[];
  /** Speech rate data calculated from word timing */
  speechRateData: { time: number; wpm: number }[];
}

/**
 * Data provided when silence is detected
 */
export interface SilenceDetectedData {
  /** Timestamp when silence was detected (milliseconds since epoch) */
  silenceDetectedAt: number;
  /** Duration of the silence timeout in milliseconds */
  silenceTimeout: number;
  /** Total duration since last speech activity in milliseconds */
  timeSinceLastSpeech: number;
  /** Current transcript at the time of silence detection */
  currentTranscript: string;
  /** Current interim transcript at the time of silence detection */
  currentInterimTranscript: string;
  /** Current audio metrics at the time of silence detection */
  currentAudioMetrics: AudioMetrics;
}

/**
 * Data provided when speech starts (user begins speaking)
 */
export interface SpeechStartData {
  /** Timestamp when speech started (milliseconds since epoch) */
  speechStartedAt: number;
  /** Volume level that triggered the speech detection */
  triggerVolume: number;
  /** Pitch frequency detected at speech start (Hz, 0 if no pitch) */
  startPitch: number;
  /** Current audio metrics at the time of speech start */
  currentAudioMetrics: AudioMetrics;
}

/**
 * Data provided when speech ends (user stops speaking)
 */
export interface SpeechEndData {
  /** Timestamp when speech ended (milliseconds since epoch) */
  speechEndedAt: number;
  /** Duration of the pause that triggered the speech end detection (milliseconds) */
  pauseDuration: number;
  /** Volume level when speech ended */
  endVolume: number;
  /** Last pitch frequency before speech ended (Hz, 0 if no pitch) */
  endPitch: number;
  /** Current transcript at the time of speech end */
  currentTranscript: string;
  /** Current interim transcript at the time of speech end */
  currentInterimTranscript: string;
  /** Current audio metrics at the time of speech end */
  currentAudioMetrics: AudioMetrics;
}

/**
 * Data provided when a speech recognition error occurs
 */
export interface SpeechErrorData {
  /** Timestamp when the error occurred (milliseconds since epoch) */
  errorOccurredAt: number;
  /** The error type from the SpeechRecognitionErrorEvent */
  errorType: string;
  /** The error message from the SpeechRecognitionErrorEvent */
  errorMessage: string;
  /** Whether this is a critical error that stops recognition */
  isCritical: boolean;
  /** Current transcript at the time of error */
  currentTranscript: string;
  /** Current interim transcript at the time of error */
  currentInterimTranscript: string;
  /** Current audio metrics at the time of error */
  currentAudioMetrics: AudioMetrics;
  /** Whether the hook will attempt to restart recognition automatically */
  willAttemptRestart: boolean;
}