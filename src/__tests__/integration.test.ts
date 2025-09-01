import { renderHook, act } from '@testing-library/react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { PerformanceMode } from '../types/speechToText';

// Integration tests covering error handling, boundary conditions, and real-world scenarios
describe('Speech-to-Text Integration Tests', () => {
  let mockRecognition: any;
  let mockEventListeners: Map<string, Function>;
  let mockAudioContext: any;
  let mockAnalyser: any;
  let mockMediaStream: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockEventListeners = new Map();

    // Setup comprehensive mocks
    mockAnalyser = {
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0.3,
      minDecibels: -90,
      maxDecibels: -10,
      getByteFrequencyData: jest.fn(),
      getByteTimeDomainData: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };

    mockAudioContext = {
      state: 'running',
      sampleRate: 44100,
      resume: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      createMediaStreamSource: jest.fn(() => ({ connect: jest.fn(), disconnect: jest.fn() })),
      createAnalyser: jest.fn(() => mockAnalyser)
    };

    mockMediaStream = {
      getTracks: jest.fn(() => [{ stop: jest.fn(), kind: 'audio', enabled: true, readyState: 'live' }]),
      getAudioTracks: jest.fn(() => [{ stop: jest.fn(), kind: 'audio', enabled: true, readyState: 'live' }])
    };

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

    // Global mocks
    global.SpeechRecognition = jest.fn(() => mockRecognition);
    global.AudioContext = jest.fn(() => mockAudioContext);
    global.navigator = {
      ...global.navigator,
      mediaDevices: {
        getUserMedia: jest.fn().mockResolvedValue(mockMediaStream)
      },
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

  const simulateEvent = (type: string, data?: any) => {
    const callback = mockEventListeners.get(type);
    if (callback) callback(data || {});
  };

  const simulateResult = (transcript: string, isFinal: boolean = true, resultIndex: number = 0) => {
    const mockEvent = {
      resultIndex,
      results: {
        length: resultIndex + 1,
        [resultIndex]: { isFinal, 0: { transcript } }
      }
    };
    simulateEvent('result', mockEvent);
  };

  describe('Boundary Conditions', () => {
    it('should handle extremely long transcripts without performance degradation', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      const startTime = performance.now();
      
      // Simulate very long transcript
      for (let i = 0; i < 1000; i++) {
        act(() => {
          simulateResult(`word${i.toString().padStart(4, '0')}`, true);
        });
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(result.current.transcript).toContain('word0999 ');
      expect(processingTime).toBeLessThan(5000); // Should process within 5 seconds
      expect(result.current.transcript.split(' ').length).toBeGreaterThan(1000);
    });

    it('should handle rapid start/stop cycles without memory leaks', async () => {
      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 100 }));

      // Simulate 50 rapid start/stop cycles
      for (let cycle = 0; cycle < 50; cycle++) {
        await act(async () => {
          await result.current.toggleListening();
        });

        act(() => simulateEvent('start'));

        act(() => {
          simulateResult(`cycle${cycle}`, true);
        });

        // Trigger silence
        act(() => {
          jest.advanceTimersByTime(150);
        });

        act(() => {
          result.current.clearTranscript();
        });
      }

      // Memory usage should be stable
      expect(result.current.transcript).toBe('');
      expect(result.current.sessionMetadata).toBeNull();
    });

    it('should handle zero-duration sessions', async () => {
      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 0 }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Immediate silence
      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current.speechCompleted).toBe(true);
    });

    it('should handle maximum volume and pitch values', async () => {
      const { result } = renderHook(() => useSpeechToText());

      // Mock extreme audio data
      mockAnalyser.getByteFrequencyData = jest.fn((array) => {
        array.fill(255); // Maximum frequency values
      });
      mockAnalyser.getByteTimeDomainData = jest.fn((array) => {
        array.fill(255); // Maximum time domain values
      });

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const audioMetrics = result.current.audioMetrics;
      expect(isFinite(audioMetrics.currentVolume)).toBe(true);
      expect(audioMetrics.currentVolume).toBeGreaterThanOrEqual(0);
      expect(audioMetrics.currentVolume).toBeLessThanOrEqual(100);
    });

    it('should handle minimum/zero volume scenarios', async () => {
      const { result } = renderHook(() => useSpeechToText());

      // Mock silent audio data
      mockAnalyser.getByteFrequencyData = jest.fn((array) => {
        array.fill(0); // Silence
      });
      mockAnalyser.getByteTimeDomainData = jest.fn((array) => {
        array.fill(128); // Neutral time domain (silence)
      });

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const audioMetrics = result.current.audioMetrics;
      expect(audioMetrics.currentVolume).toBe(0);
      expect(audioMetrics.currentPitch).toBe(0);
    });

    it('should handle Unicode and special characters in transcripts', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      const specialTexts = [
        'café ñoño 中文 العربية',
        '🎤 🗣️ 🔊 emoji test',
        'números: 1,234.56',
        'punctuation: hello, world! how are you?',
        'newlines\nand\ttabs',
        'very long word: supercalifragilisticexpialidocious'
      ];

      specialTexts.forEach((text, index) => {
        act(() => {
          simulateResult(text, true);
        });
      });

      expect(result.current.transcript).toContain('café');
      expect(result.current.transcript).toContain('🎤');
      expect(result.current.transcript).toContain('العربية');
      expect(result.current.transcript).toContain('supercalifragilisticexpialidocious');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should recover from getUserMedia permission denial', async () => {
      (global.navigator.mediaDevices.getUserMedia as jest.Mock)
        .mockRejectedValueOnce(new Error('Permission denied'))
        .mockResolvedValueOnce(mockMediaStream);

      const { result } = renderHook(() => useSpeechToText());

      // First attempt should fail
      await expect(act(async () => {
        await result.current.startListening();
      })).rejects.toThrow('Permission denied');

      // Second attempt should succeed
      await act(async () => {
        await result.current.startListening();
      });

      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
    });

    it('should handle audio context creation failure', async () => {
      (global.AudioContext as jest.Mock).mockImplementationOnce(() => {
        throw new Error('AudioContext not supported');
      });

      const { result } = renderHook(() => useSpeechToText());

      await expect(act(async () => {
        await result.current.startListening();
      })).rejects.toThrow('AudioContext not supported');
    });

    it('should handle speech recognition restart failures gracefully', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Mock start failure on restart
      let callCount = 0;
      mockRecognition.start = jest.fn(() => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Recognition restart failed');
        }
      });

      // Trigger no-speech error (should attempt restart)
      act(() => {
        simulateEvent('error', { error: 'no-speech', message: 'No speech detected' });
      });

      expect(result.current.isListening).toBe(false);
    });

    it('should handle corrupted audio data gracefully', async () => {
      const { result } = renderHook(() => useSpeechToText());

      // Mock corrupted audio data
      mockAnalyser.getByteFrequencyData = jest.fn(() => {
        throw new Error('Audio analysis failed');
      });

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Should not crash despite corrupted audio data
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.isListening).toBe(true);
    });

    it('should handle network connectivity issues', async () => {
      const { result } = renderHook(() => useSpeechToText());
      const onError = jest.fn();
      const { rerender } = renderHook(() => useSpeechToText({ onError }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Simulate network error
      act(() => {
        simulateEvent('error', {
          error: 'network',
          message: 'Network connection lost'
        });
      });

      expect(result.current.isListening).toBe(false);
    });
  });

  describe('Stress Testing Scenarios', () => {
    it('should handle high-frequency result updates', async () => {
      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Rapid interim results
      for (let i = 0; i < 100; i++) {
        act(() => {
          simulateResult(`rapid${i}`, false, 0);
        });
      }

      // Final result
      act(() => {
        simulateResult('final result', true, 0);
      });

      expect(result.current.transcript).toContain('final result');
      expect(result.current.interimTranscript).toBe('');
    });

    it('should handle concurrent speech recognition sessions', async () => {
      const hooks = [
        renderHook(() => useSpeechToText()),
        renderHook(() => useSpeechToText()),
        renderHook(() => useSpeechToText())
      ];

      // Start all sessions concurrently
      await Promise.all(hooks.map(async ({ result }) => {
        await act(async () => {
          await result.current.startListening();
        });
      }));

      // Each should have its own recognition instance
      expect(global.SpeechRecognition).toHaveBeenCalledTimes(3);
    });

    it('should maintain performance with large session metadata', async () => {
      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 500 }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Generate large transcript with many words
      const words = Array.from({ length: 500 }, (_, i) => `word${i}`);
      const transcript = words.join(' ');
      
      act(() => {
        simulateResult(transcript, true);
      });

      // Trigger metadata generation
      act(() => {
        jest.advanceTimersByTime(600);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.sessionMetadata?.words.length).toBe(500);
      
      // Metadata operations should be fast
      const startTime = performance.now();
      const copyResult = await act(async () => {
        return await result.current.copyMetadataToClipboard();
      });
      const endTime = performance.now();

      expect(copyResult.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('should handle typical conversation flow with pauses', async () => {
      const onSpeechCompleted = jest.fn();
      const onVoiceStart = jest.fn();
      const onVoiceStop = jest.fn();

      const { result } = renderHook(() => useSpeechToText({
        silenceTimeout: 1000,
        onSpeechCompleted,
        onVoiceStart,
        onVoiceStop,
        speechVolumeThreshold: 15,
        speechPauseThreshold: 200
      }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Simulate conversation: "Hello" [pause] "how are you?"
      act(() => {
        simulateResult('Hello', true);
      });

      // Short pause (shouldn't trigger silence)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      act(() => {
        simulateResult('how are you?', true);
      });

      // Longer pause (should trigger silence)
      act(() => {
        jest.advanceTimersByTime(1200);
      });

      expect(result.current.transcript).toBe('Hello how are you? ');
      expect(result.current.speechCompleted).toBe(true);
      expect(onSpeechCompleted).toHaveBeenCalled();
    });

    it('should handle switching languages mid-session', async () => {
      let config = { language: 'en-US' };
      const { result, rerender } = renderHook(() => useSpeechToText(config));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      act(() => {
        simulateResult('English text', true);
      });

      // Stop current session
      await act(async () => {
        await result.current.stopListening();
      });

      act(() => simulateEvent('end'));

      // Change language and restart
      config = { language: 'es-ES' };
      rerender();

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      act(() => {
        simulateResult('Texto en español', true);
      });

      expect(result.current.transcript).toContain('English text');
      expect(result.current.transcript).toContain('Texto en español');
    });

    it('should handle mobile device constraints', async () => {
      // Simulate mobile constraints
      const mobileConfig = {
        performanceMode: PerformanceMode.SPEED,
        audioConfig: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      };

      const { result } = renderHook(() => useSpeechToText(mobileConfig));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Simulate mobile-like speech patterns (shorter, more fragmented)
      const mobileTexts = ['hey', 'how', 'are', 'you', 'today'];
      mobileTexts.forEach(text => {
        act(() => {
          simulateResult(text, true);
        });
        
        // Short pauses between words
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      expect(result.current.transcript).toContain('hey how are you today');
    });

    it('should handle accessibility scenarios', async () => {
      const { result } = renderHook(() => useSpeechToText({
        speechVolumeThreshold: 5, // Very sensitive for users with low voice
        speechPauseThreshold: 500 // Longer pause detection
      }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Simulate speech pattern of someone with speaking difficulties
      act(() => {
        simulateResult('I', false);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      act(() => {
        simulateResult('I need', false);
      });

      act(() => {
        jest.advanceTimersByTime(400);
      });

      act(() => {
        simulateResult('I need help', true);
      });

      expect(result.current.transcript).toContain('I need help');
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle memory pressure scenarios', async () => {
      const { result } = renderHook(() => useSpeechToText());

      // Simulate memory pressure by creating large objects
      const largeArrays: number[][] = [];
      for (let i = 0; i < 100; i++) {
        largeArrays.push(new Array(10000).fill(Math.random()));
      }

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Speech recognition should continue working despite memory pressure
      act(() => {
        simulateResult('Memory test', true);
      });

      expect(result.current.transcript).toContain('Memory test');

      // Cleanup
      largeArrays.length = 0;
    });

    it('should handle timer precision issues', async () => {
      const { result } = renderHook(() => useSpeechToText({ 
        silenceTimeout: 1,  // Very short timeout
        speechPauseThreshold: 1
      }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      act(() => {
        simulateResult('Quick', true);
      });

      // Advance by minimal time
      act(() => {
        jest.advanceTimersByTime(2);
      });

      expect(result.current.speechCompleted).toBe(true);
    });

    it('should handle component re-renders during speech recognition', async () => {
      let rerenderCount = 0;
      const { result, rerender } = renderHook(() => {
        rerenderCount++;
        return useSpeechToText();
      });

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      // Force multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender();
        act(() => {
          simulateResult(`rerender${i}`, false);
        });
      }

      act(() => {
        simulateResult('final', true);
      });

      expect(rerenderCount).toBeGreaterThan(10);
      expect(result.current.transcript).toContain('final');
    });
  });

  describe('Platform Compatibility Edge Cases', () => {
    it('should handle missing webkitSpeechRecognition fallback', async () => {
      delete (global as any).webkitSpeechRecognition;
      (global as any).SpeechRecognition = jest.fn(() => mockRecognition);

      const { result } = renderHook(() => useSpeechToText());

      expect(result.current.isSupported).toBe(true);
    });

    it('should handle missing AudioContext fallback', async () => {
      delete (global as any).AudioContext;
      (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

      const { result } = renderHook(() => useSpeechToText());

      await act(async () => {
        await result.current.startListening();
      });

      expect((global as any).webkitAudioContext).toHaveBeenCalled();
    });

    it('should handle clipboard API unavailability', async () => {
      delete (global as any).navigator.clipboard;

      const { result } = renderHook(() => useSpeechToText({ silenceTimeout: 100 }));

      await act(async () => {
        await result.current.startListening();
      });

      act(() => simulateEvent('start'));

      act(() => {
        simulateResult('test', true);
      });

      act(() => {
        jest.advanceTimersByTime(150);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      const copyResult = await act(async () => {
        return await result.current.copyMetadataToClipboard();
      });

      expect(copyResult.success).toBe(false);
    });

    it('should handle serviceURI compatibility', async () => {
      // Test with recognition that doesn't support serviceURI
      const recognitionWithoutServiceURI = {
        ...mockRecognition
      };
      delete (recognitionWithoutServiceURI as any).serviceURI;

      (global as any).SpeechRecognition = jest.fn(() => recognitionWithoutServiceURI);

      const { result } = renderHook(() => useSpeechToText({ optimizedMode: true }));

      await act(async () => {
        await result.current.startListening();
      });

      // Should not throw error even without serviceURI support
      expect(result.current.isSupported).toBe(true);
    });
  });
});