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