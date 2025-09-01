import { PitchDetector } from 'pitchy';
import { useCallback, useMemo, useRef } from 'react';
import { AudioMetrics, PerformanceMode } from '../types/speechToText';

// Optimized autocorrelation with early termination and stride optimization
const detectPitchWithAutocorrelation = (buffer: Float32Array, sampleRate: number): number => {
  const SIZE = buffer.length;
  const MIN_PERIOD = Math.floor(sampleRate / 800); // 800Hz max
  const MAX_PERIOD = Math.floor(sampleRate / 60);  // 60Hz min
  const searchRange = Math.min(Math.floor(SIZE / 2), MAX_PERIOD);
  
  // Quick RMS check with early exit
  let rms = 0;
  const rmsSize = Math.min(512, SIZE); // Further reduced for speed
  for (let i = 0; i < rmsSize; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / rmsSize);
  
  if (rms < 0.01) return 0; // Early exit for weak signal
  
  let bestOffset = -1;
  let bestCorrelation = 0;
  const correlationSamples = Math.min(256, SIZE); // Reduced correlation window
  const stride = Math.max(1, Math.floor(searchRange / 80)); // Adaptive stride
  
  // Optimized correlation with stride and early termination
  for (let offset = MIN_PERIOD; offset < searchRange; offset += stride) {
    let correlation = 0;
    const maxSamples = Math.min(correlationSamples, SIZE - offset);
    
    for (let i = 0; i < maxSamples; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - (correlation / maxSamples);
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
      
      // Early termination for very good correlation
      if (correlation > 0.8) break;
    }
  }
  
  return (bestCorrelation > 0.3 && bestOffset !== -1) ? sampleRate / bestOffset : 0;
};

export const useAudioAnalysis = (performanceMode: PerformanceMode = PerformanceMode.BALANCED) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const volumeDataRef = useRef<{ time: number; volume: number }[]>([]);
  const pitchDataRef = useRef<{ time: number; pitch: number }[]>([]);
  const spectralCentroidDataRef = useRef<{ time: number; spectralCentroid: number }[]>([]);
  const pitchDetectorRef = useRef<PitchDetector<Float32Array> | null>(null);
  const sessionStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const isMonitoringRef = useRef<boolean>(false);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisRef = useRef<{ volume: number; volumeForUI: number; pitch: number; spectralCentroid: number } | null>(null);

  // Memoized performance config to prevent recalculation
  const config = useMemo(() => ({
    [PerformanceMode.SPEED]: {
      fftSize: 1024,
      updateFreq: 15,
      pitchBuffer: 1024,
      hammingThreshold: 20,
      backupThreshold: 25,
      clarityThreshold: 0.25,
      voiceRange: { start: 80, end: 2000 } // Narrower for speed
    },
    [PerformanceMode.BALANCED]: {
      fftSize: 2048,
      updateFreq: 20,
      pitchBuffer: 2048,
      hammingThreshold: 10,
      backupThreshold: 15,
      clarityThreshold: 0.2,
      voiceRange: { start: 80, end: 3000 }
    },
    [PerformanceMode.QUALITY]: {
      fftSize: 4096,
      updateFreq: 30,
      pitchBuffer: 4096,
      hammingThreshold: 5,
      backupThreshold: 10,
      clarityThreshold: 0.15,
      voiceRange: { start: 80, end: 4000 } // Wider for quality
    }
  }), [])[performanceMode];

  // Pre-computed constants for volume calculation
  const volumeConstants = useMemo(() => ({
    normalizeFactor: 1 / 255,
    dbOffset: 60,
    uiScale: 100 / 60
  }), []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isMonitoringRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const sampleRate = audioContextRef.current.sampleRate;
    
    // Reuse buffers to reduce GC pressure
    const freqDataArray = new Uint8Array(bufferLength);
    const dataArray = new Uint8Array(bufferLength);

    // Optimized volume calculation with pre-computed ranges
    analyserRef.current.getByteFrequencyData(freqDataArray);
    const voiceRangeStart = Math.floor((config.voiceRange.start / (sampleRate / 2)) * bufferLength);
    const voiceRangeEnd = Math.floor((config.voiceRange.end / (sampleRate / 2)) * bufferLength);
    
    // Single pass voice frequency analysis
    let voiceSum = 0;
    for (let i = voiceRangeStart; i < voiceRangeEnd; i++) {
      voiceSum += freqDataArray[i];
    }
    const voiceAverage = voiceSum / (voiceRangeEnd - voiceRangeStart);
    const freqVolumeDB = voiceAverage > 0 ? 20 * Math.log10(voiceAverage * volumeConstants.normalizeFactor) : -Infinity;

    // RMS calculation with early termination
    analyserRef.current.getByteTimeDomainData(dataArray);
    let rmsSum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const sample = (dataArray[i] - 128) / 128;
      rmsSum += sample * sample;
    }
    const rms = Math.sqrt(rmsSum / bufferLength);
    const rmsVolumeDB = rms > 0 ? 20 * Math.log10(rms) : -Infinity;

    // Optimized volume normalization
    const rawVolumeDB = Math.max(freqVolumeDB, rmsVolumeDB);
    const finalVolumeDB = isFinite(rawVolumeDB) ? 
      Math.max(0, Math.round((rawVolumeDB + volumeConstants.dbOffset) * 100) / 100) : 0;

    // Debug log for volume calculation
    if (Math.random() < 0.05) { // 5% chance to avoid spam
      console.log('🔊 Volume Debug:', {
        averageLevel,
        voiceAverage,
        rms,
        freqVolumeDB,
        rmsVolumeDB,
        rawVolumeDB,
        finalVolumeDB,
        dbOffset: volumeConstants.dbOffset,
        uiScale: volumeConstants.uiScale
      });
    }

    // Pitch detection with conditional processing
    let pitchHz = 0;
    if (pitchDetectorRef.current && finalVolumeDB > 1) { // Early exit for low volume
      const pitchBufferLength = Math.min(config.pitchBuffer, analyserRef.current.fftSize);
      const pitchTimeData = new Uint8Array(pitchBufferLength);
      analyserRef.current.getByteTimeDomainData(pitchTimeData);
      
      // Efficient conversion to Float32Array
      const float32Data = new Float32Array(pitchBufferLength);
      for (let i = 0; i < pitchBufferLength; i++) {
        float32Data[i] = (pitchTimeData[i] - 128) / 128;
      }
      
      // Conditional Hamming window application
      if (finalVolumeDB > config.hammingThreshold) {
        const windowScale = 2 * Math.PI / (float32Data.length - 1);
        for (let i = 0; i < float32Data.length; i++) {
          float32Data[i] *= 0.54 - 0.46 * Math.cos(windowScale * i);
        }
      }
      
      const [pitch, clarity] = pitchDetectorRef.current.findPitch(float32Data, sampleRate);
      
      // Optimized pitch validation
      if (clarity > config.clarityThreshold && pitch >= 60 && pitch <= 800) {
        pitchHz = Math.round(pitch * 10) / 10;
      }
      
      // Backup method with higher threshold
      if (pitchHz === 0 && finalVolumeDB > config.backupThreshold) {
        const detectedPitch = detectPitchWithAutocorrelation(float32Data, sampleRate);
        if (detectedPitch >= 60 && detectedPitch <= 800) {
          pitchHz = Math.round(detectedPitch * 10) / 10;
        }
      }
    }

    // Optimized spectral centroid with early exit
    let spectralCentroidHz = 0;
    if (finalVolumeDB > 5) { // Only calculate if volume is significant
      const frequencyData = freqDataArray; // Reuse existing frequency data
      let weightedSum = 0;
      let magnitudeSum = 0;
      const binSize = (sampleRate / 2) / frequencyData.length;
      
      // Single pass calculation
      for (let i = 0; i < frequencyData.length; i++) {
        const magnitude = frequencyData[i];
        if (magnitude > 0) { // Skip zero magnitude bins
          const frequency = i * binSize;
          weightedSum += frequency * magnitude;
          magnitudeSum += magnitude;
        }
      }
      
      if (magnitudeSum > 0) {
        spectralCentroidHz = Math.round((weightedSum / magnitudeSum) * 10) / 10;
      }
    }

    // Efficient data storage
    const currentTime = Date.now() - sessionStartTimeRef.current;
    volumeDataRef.current.push({ time: currentTime, volume: finalVolumeDB });
    pitchDataRef.current.push({ time: currentTime, pitch: pitchHz });
    spectralCentroidDataRef.current.push({ time: currentTime, spectralCentroid: spectralCentroidHz });

    const result = {
      volume: finalVolumeDB,
      volumeForUI: Math.max(0, Math.min(100, finalVolumeDB * volumeConstants.uiScale)),
      pitch: pitchHz,
      spectralCentroid: spectralCentroidHz
    };

    // Store last analysis for real-time access
    lastAnalysisRef.current = result;
    
    return result;
  }, [config, volumeConstants]);

  const startVolumeMonitoring = useCallback(() => {
    if (!analyserRef.current) return;
    
    const updateFrequency = 1000 / config.updateFreq;

    // Simplified monitoring with single timer
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    
    analysisIntervalRef.current = setInterval(() => {
      if (!isMonitoringRef.current) {
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
        return;
      }
      analyzeAudio();
    }, updateFrequency);
  }, [analyzeAudio, config.updateFreq]);

  const initializeAudioAnalysis = useCallback(async (audioConfig = {}) => {
    console.log('🔧 InitializeAudioAnalysis called with config:', audioConfig);
    try {
      // Stream acquisition with optimized constraints
      console.log('📡 Requesting getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          ...audioConfig
        } 
      });
      console.log('✅ getUserMedia successful, got stream:', !!stream);
      mediaStreamRef.current = stream;
      
      // Audio context setup
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Analyser configuration
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = config.fftSize;
      analyserRef.current.smoothingTimeConstant = 0.3;
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      
      source.connect(analyserRef.current);
      
      // Initialize pitch detector
      pitchDetectorRef.current = PitchDetector.forFloat32Array(analyserRef.current.fftSize);
      
      // Reset data arrays
      volumeDataRef.current.length = 0;
      pitchDataRef.current.length = 0;
      spectralCentroidDataRef.current.length = 0;
      sessionStartTimeRef.current = Date.now();
      
      isMonitoringRef.current = true;
      console.log('🚀 Starting volume monitoring...');
      startVolumeMonitoring();
      console.log('🎉 Audio analysis initialization complete!');
    } catch (error) {
      console.error('🚨 Error in initializeAudioAnalysis:', error);
      throw error;
    }
  }, [startVolumeMonitoring, config.fftSize]);

  const stopAudioAnalysis = useCallback(() => {
    isMonitoringRef.current = false;
    
    // Cleanup all resources
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Optimized data access using last stored analysis
  const getAudioData = useCallback((): AudioMetrics => {
    const lastAnalysis = lastAnalysisRef.current;
    return {
      currentVolume: lastAnalysis?.volumeForUI || 0,
      currentPitch: lastAnalysis?.pitch || 0,
      currentSpectralCentroid: lastAnalysis?.spectralCentroid || 0,
      volumeData: volumeDataRef.current.slice(), // Shallow copy
      pitchData: pitchDataRef.current.slice(),
      spectralCentroidData: spectralCentroidDataRef.current.slice()
    };
  }, []);

  const clearAudioData = useCallback(() => {
    // Efficient array clearing
    volumeDataRef.current.length = 0;
    pitchDataRef.current.length = 0;
    spectralCentroidDataRef.current.length = 0;
  }, []);

  const getSessionStartTime = useCallback(() => sessionStartTimeRef.current, []);

  return {
    initializeAudioAnalysis,
    stopAudioAnalysis,
    getAudioData,
    clearAudioData,
    getSessionStartTime,
    volumeDataRef,
    pitchDataRef,
    spectralCentroidDataRef
  };
};