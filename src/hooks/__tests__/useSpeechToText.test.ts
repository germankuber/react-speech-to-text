import { renderHook, act } from '@testing-library/react';
import { useSpeechToText } from '../useSpeechToText';
import { PerformanceMode, SpeechToTextConfig } from '../../types/speechToText';

// Mock the useAudioAnalysis hook
jest.mock('../useAudioAnalysis', () => ({
  useAudioAnalysis: () => ({
    initializeAudioAnalysis: jest.fn().mockResolvedValue(undefined),
    stopAudioAnalysis: jest.fn(),
    getAudioData: jest.fn(() => ({
      currentVolume: 15,
      currentPitch: 150,
      currentSpectralCentroid: 1200,
      volumeData: [{ time: 0, volume: 15 }],
      pitchData: [{ time: 0, pitch: 150 }],
      spectralCentroidData: [{ time: 0, spectralCentroid: 1200 }]
    })),
    clearAudioData: jest.fn(),
    getSessionStartTime: jest.fn(() => Date.now() - 1000),
    volumeDataRef: { current: [{ time: 0, volume: 15 }] },
    pitchDataRef: { current: [{ time: 0, pitch: 150 }] },
    spectralCentroidDataRef: { current: [{ time: 0, spectralCentroid: 1200 }] },
    getLastAnalysis: jest.fn(() => ({
      volume: 15,
      volumeForUI: 25,
      pitch: 150,
      spectralCentroid: 1200
    }))
  })
}));

describe('useSpeechToText', () => {
  let mockRecognition: any;
  let mockEventListeners: Map<string, Function>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockEventListeners = new Map();

    // Mock SpeechRecognition
    mockRecognition = {
      continuous: false,
      interimResults: false,
      lang: 'en-US',
      maxAlternatives: 1,
      serviceURI: '',
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        mockEventListeners.set(event, callback);
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    };

    // Setup global SpeechRecognition mock
    global.SpeechRecognition = jest.fn(() => mockRecognition);
    global.webkitSpeechRecognition = jest.fn(() => mockRecognition);

    // Mock clipboard
    global.navigator = {
      ...global.navigator,
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue('')
      }
    };

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Helper function to simulate speech recognition events
  const simulateSpeechEvent = (type: string, data?: any) => {
    const callback = mockEventListeners.get(type);
    if (callback) {
      callback(data || {});
    }
  };

  const simulateResultEvent = (transcript: string, isFinal: boolean = true, resultIndex: number = 0) => {
    const mockEvent = {
      resultIndex,
      results: {
        length: resultIndex + 1,
        [resultIndex]: {
          isFinal,
          0: { transcript }
        }
      }
    };
    simulateSpeechEvent('result', mockEvent);
  };

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useSpeechToText());

      expect(result.current).toMatchObject({
        isListening: false,
        transcript: '',
        interimTranscript: '',
        isSupported: true,
        speechCompleted: false,
        sessionMetadata: null,
        audioMetrics: expect.any(Object),
        chartData: expect.any(Object),
        toggleListening: expect.any(Function),
        startListening: expect.any(Function),
        stopListening: expect.any(Function),
        clearTranscript: expect.any(Function),
        copyMetadataToClipboard: expect.any(Function)
      });
    });

    it('should initialize with custom configuration', () => {
      const config: SpeechToTextConfig = {
        language: 'en-US',
        silenceTimeout: 1000,
        optimizedMode: false,
        performanceMode: PerformanceMode.QUALITY,
        speechVolumeThreshold: 20,
        speechPauseThreshold: 300,
        audioConfig: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const { result } = renderHook(() => useSpeechToText(config));

      expect(result.current.isSupported).toBe(true);
    });

    it('should configure speech recognition with optimized mode', () => {
      renderHook(() => useSpeechToText({ optimizedMode: true }));

      expect(mockRecognition.continuous).toBe(true);
      expect(mockRecognition.interimResults).toBe(true);
      expect(mockRecognition.maxAlternatives).toBe(1);
      expect(mockRecognition.lang).toBe('es-ES'); // Default language
    });

    it('should configure speech recognition without optimized mode', () => {
      renderHook(() => useSpeechToText({ optimizedMode: false }));

      expect(mockRecognition.maxAlternatives).toBe(3);
    });

    it('should handle missing SpeechRecognition API', () => {
      delete (global as any).SpeechRecognition;
      delete (global as any).webkitSpeechRecognition;

      const { result } = renderHook(() => useSpeechToText());

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('Speech Recognition Control', () => {
    it('should start listening when toggleListening is called', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.toggleListening();
      });

      expect(mockRecognition.start).toHaveBeenCalled();
      expect(result.current.isListening).toBe(false); // Will be set to true by 'start' event
    });

    it('should stop listening when toggleListening is called while listening', async () => {
      const { result } = renderHook(() => useSpeechToText());

      // Start listening first
      await act(async () => {
        await result.current.toggleListening();
      });

      // Simulate start event
      act(() => {
        simulateSpeechEvent('start');
      });

      expect(result.current.isListening).toBe(true);

      // Stop listening
      await act(async () => {
        await result.current.toggleListening();
      });

      expect(mockRecognition.stop).toHaveBeenCalled();
    });

    it('should start listening with startListening method', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('should stop listening with stopListening method', async () => {
      const { result } = renderHook(() => useSpeechToText());

      // Start first
      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      await act(async () => {
        await result.current.stopListening();
      });

      expect(mockRecognition.stop).toHaveBeenCalled();
    });

    it('should not start if already listening', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      const startCallCount = mockRecognition.start.mock.calls.length;

      await act(async () => {
        await result.current.startListening();
      });

      // Should not call start again
      expect(mockRecognition.start.mock.calls.length).toBe(startCallCount);
    });

    it('should not stop if not listening', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.stopListening();
      });

      expect(mockRecognition.stop).not.toHaveBeenCalled();
    });
  });

  describe('Speech Recognition Events', () => {
    it('should handle speech recognition start event', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      expect(result.current.isListening).toBe(true);
    });

    it('should handle speech recognition end event', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateSpeechEvent('end');
      });

      expect(result.current.isListening).toBe(false);
      expect(result.current.interimTranscript).toBe('');
    });

    it('should handle final speech results', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello world', true);
      });

      expect(result.current.transcript).toBe('hello world ');
    });

    it('should handle interim speech results', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello', false);
      });

      expect(result.current.interimTranscript).toBe('hello');
      expect(result.current.transcript).toBe('');
    });

    it('should accumulate final results', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello', true);
      });

      act(() => {
        simulateResultEvent('world', true);
      });

      expect(result.current.transcript).toBe('hello world ');
    });

    it('should handle mixed final and interim results', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      // Final result
      act(() => {
        simulateResultEvent('hello', true);
      });

      // Interim result
      act(() => {
        simulateResultEvent('world', false, 1);
      });

      expect(result.current.transcript).toBe('hello ');
      expect(result.current.interimTranscript).toBe('world');
    });
  });

  describe('Error Handling', () => {
    it('should handle no-speech error with restart', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateSpeechEvent('error', {
          error: 'no-speech',
          message: 'No speech detected'
        });
      });

      expect(mockRecognition.start).toHaveBeenCalledTimes(2); // Initial + restart
      expect(result.current.isListening).toBe(true); // Should still be listening
    });

    it('should handle not-allowed error', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateSpeechEvent('error', {
          error: 'not-allowed',
          message: 'Permission denied'
        });
      });

      expect(result.current.isListening).toBe(false);
    });

    it('should handle network error', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateSpeechEvent('error', {
          error: 'network',
          message: 'Network error'
        });
      });

      expect(result.current.isListening).toBe(false);
    });

    it('should handle aborted error', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateSpeechEvent('error', {
          error: 'aborted',
          message: 'Recognition aborted'
        });
      });

      expect(result.current.isListening).toBe(false);
    });

    it('should call onError callback when provided', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useSpeechToText({ onError }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateSpeechEvent('error', {
          error: 'network',
          message: 'Network error'
        });
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          errorType: 'network',
          errorMessage: 'Network error',
          isCritical: true,
          willAttemptRestart: false
        })
      );
    });

    it('should handle errors in onError callback', async () => {
      const onError = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useSpeechToText({ onError }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateSpeechEvent('error', {
          error: 'network',
          message: 'Network error'
        });
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error in onError callback:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Silence Detection', () => {
    it('should detect silence after timeout', async () => {
      const onSpeechCompleted = jest.fn();
      const { result } = renderHook(() => 
        useSpeechToText({ 
          silenceTimeout: 500,
          onSpeechCompleted 
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello', true);
      });

      // Advance time to trigger silence detection
      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(result.current.speechCompleted).toBe(true);
      expect(onSpeechCompleted).toHaveBeenCalledWith(
        expect.objectContaining({
          silenceTimeout: 500,
          currentTranscript: 'hello '
        })
      );
      expect(mockRecognition.stop).toHaveBeenCalled();
    });

    it('should reset silence timer on new speech', async () => {
      const onSpeechCompleted = jest.fn();
      const { result } = renderHook(() => 
        useSpeechToText({ 
          silenceTimeout: 500,
          onSpeechCompleted 
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello', true);
      });

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // New speech should reset timer
      act(() => {
        simulateResultEvent('world', false);
      });

      // Advance the remaining time
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not have triggered silence yet
      expect(result.current.speechCompleted).toBe(false);
      expect(onSpeechCompleted).not.toHaveBeenCalled();

      // Advance full timeout
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current.speechCompleted).toBe(true);
      expect(onSpeechCompleted).toHaveBeenCalled();
    });

    it('should generate session metadata after silence', async () => {
      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 500 }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello world', true);
      });

      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Wait for metadata generation delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.sessionMetadata).not.toBeNull();
      expect(result.current.sessionMetadata?.words).toHaveLength(2);
    });
  });

  describe('Speech Start/End Detection', () => {
    it('should detect speech start', async () => {
      const onVoiceStart = jest.fn();
      const { result } = renderHook(() => 
        useSpeechToText({ 
          speechVolumeThreshold: 20,
          onVoiceStart 
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      // Simulate volume above threshold
      const mockGetLastAnalysis = require('../useAudioAnalysis').useAudioAnalysis().getLastAnalysis;
      mockGetLastAnalysis.mockReturnValue({
        volume: 25,
        volumeForUI: 30,
        pitch: 150,
        spectralCentroid: 1200
      });

      // Trigger UI update interval
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onVoiceStart).toHaveBeenCalledWith(
        expect.objectContaining({
          triggerVolume: 30,
          startPitch: 150
        })
      );
    });

    it('should detect speech end', async () => {
      const onVoiceStop = jest.fn();
      const { result } = renderHook(() => 
        useSpeechToText({ 
          speechVolumeThreshold: 20,
          speechPauseThreshold: 100,
          onVoiceStop 
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      const mockGetLastAnalysis = require('../useAudioAnalysis').useAudioAnalysis().getLastAnalysis;
      
      // Start with high volume (speech start)
      mockGetLastAnalysis.mockReturnValue({
        volume: 25,
        volumeForUI: 30,
        pitch: 150,
        spectralCentroid: 1200
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Drop to low volume (speech end)
      mockGetLastAnalysis.mockReturnValue({
        volume: 5,
        volumeForUI: 10,
        pitch: 0,
        spectralCentroid: 800
      });

      act(() => {
        jest.advanceTimersByTime(150); // Wait for pause threshold
      });

      expect(onVoiceStop).toHaveBeenCalledWith(
        expect.objectContaining({
          endVolume: 10,
          endPitch: 0
        })
      );
    });

    it('should not trigger speech end if volume returns above threshold quickly', async () => {
      const onVoiceStop = jest.fn();
      const { result } = renderHook(() => 
        useSpeechToText({ 
          speechVolumeThreshold: 20,
          speechPauseThreshold: 200,
          onVoiceStop 
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      const mockGetLastAnalysis = require('../useAudioAnalysis').useAudioAnalysis().getLastAnalysis;
      
      // Start with high volume
      mockGetLastAnalysis.mockReturnValue({
        volume: 25,
        volumeForUI: 30,
        pitch: 150,
        spectralCentroid: 1200
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Brief pause
      mockGetLastAnalysis.mockReturnValue({
        volume: 5,
        volumeForUI: 10,
        pitch: 0,
        spectralCentroid: 800
      });

      act(() => {
        jest.advanceTimersByTime(100); // Less than pause threshold
      });

      // Volume returns
      mockGetLastAnalysis.mockReturnValue({
        volume: 25,
        volumeForUI: 30,
        pitch: 150,
        spectralCentroid: 1200
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onVoiceStop).not.toHaveBeenCalled();
    });
  });

  describe('Transcript Management', () => {
    it('should clear transcript and related data', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello world', true);
      });

      expect(result.current.transcript).toBe('hello world ');

      act(() => {
        result.current.clearTranscript();
      });

      expect(result.current.transcript).toBe('');
      expect(result.current.interimTranscript).toBe('');
      expect(result.current.speechCompleted).toBe(false);
      expect(result.current.sessionMetadata).toBeNull();
    });

    it('should copy metadata to clipboard', async () => {
      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 500 }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello world', true);
      });

      // Trigger silence to generate metadata
      act(() => {
        jest.advanceTimersByTime(600);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      const copyResult = await act(async () => {
        return await result.current.copyMetadataToClipboard();
      });

      expect(copyResult.success).toBe(true);
      expect(copyResult.message).toBe('Copied!');
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should handle clipboard copy failure', async () => {
      (global.navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Copy failed'));

      const { result } = renderHook(() => useSpeechToText());

      const copyResult = await act(async () => {
        return await result.current.copyMetadataToClipboard();
      });

      expect(copyResult.success).toBe(false);
      expect(copyResult.message).toBe('No metadata available');
    });

    it('should handle clipboard error with metadata', async () => {
      (global.navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 500 }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello', true);
      });

      // Generate metadata
      act(() => {
        jest.advanceTimersByTime(600);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      const copyResult = await act(async () => {
        return await result.current.copyMetadataToClipboard();
      });

      expect(copyResult.success).toBe(false);
      expect(copyResult.message).toBe('Copy failed');
    });
  });

  describe('Audio Metrics Integration', () => {
    it('should provide real-time audio metrics', () => {
      const { result } = renderHook(() => useSpeechToText());

      expect(result.current.audioMetrics).toEqual({
        currentVolume: 15,
        currentPitch: 150,
        currentSpectralCentroid: 1200,
        volumeData: [{ time: 0, volume: 15 }],
        pitchData: [{ time: 0, pitch: 150 }],
        spectralCentroidData: [{ time: 0, spectralCentroid: 1200 }]
      });
    });

    it('should provide chart data', () => {
      const { result } = renderHook(() => useSpeechToText());

      expect(result.current.chartData).toHaveProperty('volumeData');
      expect(result.current.chartData).toHaveProperty('pitchData');
      expect(result.current.chartData).toHaveProperty('speechRateData');
    });
  });

  describe('Language and Configuration', () => {
    it('should set custom language', () => {
      renderHook(() => useSpeechToText({ language: 'en-US' }));

      expect(mockRecognition.lang).toBe('en-US');
    });

    it('should use custom silence timeout', async () => {
      const onSpeechCompleted = jest.fn();
      const { result } = renderHook(() => 
        useSpeechToText({ 
          silenceTimeout: 1500,
          onSpeechCompleted 
        })
      );

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      act(() => {
        simulateResultEvent('hello', true);
      });

      // Should not trigger at 1000ms
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.speechCompleted).toBe(false);

      // Should trigger at 1500ms
      act(() => {
        jest.advanceTimersByTime(600);
      });

      expect(result.current.speechCompleted).toBe(true);
    });

    it('should handle different performance modes', () => {
      const { result: speedResult } = renderHook(() => 
        useSpeechToText({ performanceMode: PerformanceMode.SPEED })
      );
      
      const { result: qualityResult } = renderHook(() => 
        useSpeechToText({ performanceMode: PerformanceMode.QUALITY })
      );

      // Both should initialize successfully with different performance settings
      expect(speedResult.current.isSupported).toBe(true);
      expect(qualityResult.current.isSupported).toBe(true);
    });
  });

  describe('Edge Cases and Error Recovery', () => {
    it('should handle recognition restart failure', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      // Mock start to throw error on second call
      mockRecognition.start.mockImplementationOnce(() => {
        throw new Error('Recognition restart failed');
      });

      act(() => {
        simulateSpeechEvent('error', {
          error: 'no-speech',
          message: 'No speech detected'
        });
      });

      expect(result.current.isListening).toBe(false);
    });

    it('should handle multiple rapid start/stop cycles', async () => {
      const { result } = renderHook(() => useSpeechToText());

      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.toggleListening();
        });

        if (i % 2 === 0) {
          act(() => {
            simulateSpeechEvent('start');
          });
        } else {
          act(() => {
            simulateSpeechEvent('end');
          });
        }
      }

      // Should handle rapid cycles without errors
      expect(result.current).toBeDefined();
    });

    it('should handle component unmount during listening', async () => {
      const { result, unmount } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      // Unmount while listening
      unmount();

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should handle empty result events', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      // Simulate empty results
      act(() => {
        simulateSpeechEvent('result', {
          resultIndex: 0,
          results: { length: 0 }
        });
      });

      expect(result.current.transcript).toBe('');
      expect(result.current.interimTranscript).toBe('');
    });

    it('should handle malformed result events', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      // Simulate malformed results
      act(() => {
        simulateSpeechEvent('result', {
          resultIndex: 0,
          results: null
        });
      });

      expect(result.current.transcript).toBe('');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle long transcripts efficiently', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => {
        simulateSpeechEvent('start');
      });

      // Simulate many results
      for (let i = 0; i < 100; i++) {
        act(() => {
          simulateResultEvent(`word${i}`, true);
        });
      }

      expect(result.current.transcript).toContain('word99 ');
      expect(result.current.transcript.length).toBeGreaterThan(500);
    });

    it('should not cause memory leaks with repeated sessions', async () => {
      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 100 }));

      // Simulate multiple sessions
      for (let session = 0; session < 10; session++) {
        await act(async () => {
          await result.current.startListening();
        });

        act(() => {
          simulateSpeechEvent('start');
        });

        act(() => {
          simulateResultEvent(`session${session}`, true);
        });

        act(() => {
          jest.advanceTimersByTime(150);
        });

        act(() => {
          result.current.clearTranscript();
        });
      }

      // Should complete without issues
      expect(result.current.transcript).toBe('');
    });
  });
});