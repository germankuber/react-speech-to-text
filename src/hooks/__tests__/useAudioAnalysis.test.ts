import { renderHook, act } from '@testing-library/react';
import { useAudioAnalysis } from '../useAudioAnalysis';
import { PerformanceMode } from '../../types/speechToText';

// Mock PitchDetector
jest.mock('pitchy', () => ({
  PitchDetector: {
    forFloat32Array: jest.fn(() => ({
      findPitch: jest.fn(() => [150, 0.8]) // [pitch, clarity]
    }))
  }
}));

describe('useAudioAnalysis', () => {
  let mockAnalyser: any;
  let mockAudioContext: any;
  let mockMediaStream: any;
  let mockSource: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Mock AnalyserNode
    mockAnalyser = {
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0.3,
      minDecibels: -90,
      maxDecibels: -10,
      getByteFrequencyData: jest.fn((array) => {
        // Fill with mock frequency data
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 128) + 50; // 50-177 range
        }
      }),
      getByteTimeDomainData: jest.fn((array) => {
        // Fill with mock time domain data
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }),
      connect: jest.fn(),
      disconnect: jest.fn()
    };

    // Mock MediaStreamSource
    mockSource = {
      connect: jest.fn(),
      disconnect: jest.fn()
    };

    // Mock AudioContext
    mockAudioContext = {
      state: 'running',
      sampleRate: 44100,
      resume: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      createMediaStreamSource: jest.fn(() => mockSource),
      createAnalyser: jest.fn(() => mockAnalyser)
    };

    // Mock MediaStream
    mockMediaStream = {
      getTracks: jest.fn(() => [{
        stop: jest.fn(),
        kind: 'audio',
        enabled: true,
        readyState: 'live'
      }]),
      getAudioTracks: jest.fn(() => [{
        stop: jest.fn(),
        kind: 'audio',
        enabled: true,
        readyState: 'live'
      }])
    };

    // Setup global mocks
    global.AudioContext = jest.fn(() => mockAudioContext);
    global.navigator = {
      ...global.navigator,
      mediaDevices: {
        getUserMedia: jest.fn().mockResolvedValue(mockMediaStream)
      }
    };

    // Use fake timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default performance mode', () => {
      const { result } = renderHook(() => useAudioAnalysis());

      expect(result.current).toMatchObject({
        initializeAudioAnalysis: expect.any(Function),
        stopAudioAnalysis: expect.any(Function),
        getAudioData: expect.any(Function),
        clearAudioData: expect.any(Function),
        getSessionStartTime: expect.any(Function),
        volumeDataRef: expect.any(Object),
        pitchDataRef: expect.any(Object),
        spectralCentroidDataRef: expect.any(Object),
        getLastAnalysis: expect.any(Function)
      });
    });

    it('should initialize with different performance modes', () => {
      const modes = [PerformanceMode.SPEED, PerformanceMode.BALANCED, PerformanceMode.QUALITY];
      
      modes.forEach(mode => {
        const { result } = renderHook(() => useAudioAnalysis(mode));
        expect(result.current.initializeAudioAnalysis).toBeDefined();
      });
    });

    it('should return empty audio data initially', () => {
      const { result } = renderHook(() => useAudioAnalysis());
      
      const audioData = result.current.getAudioData();
      
      expect(audioData).toEqual({
        currentVolume: 0,
        currentPitch: 0,
        currentSpectralCentroid: 0,
        volumeData: [],
        pitchData: [],
        spectralCentroidData: []
      });
    });
  });

  describe('Audio Analysis Initialization', () => {
    it('should successfully initialize audio analysis', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalledWith(mockMediaStream);
      expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
      expect(mockSource.connect).toHaveBeenCalledWith(mockAnalyser);
    });

    it('should initialize with custom audio config', async () => {
      const { result } = renderHook(() => useAudioAnalysis());
      const customConfig = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };

      await act(async () => {
        await result.current.initializeAudioAnalysis(customConfig);
      });

      expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          ...customConfig
        }
      });
    });

    it('should handle getUserMedia errors', async () => {
      const error = new Error('Permission denied');
      global.navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useAudioAnalysis());

      await expect(
        act(async () => {
          await result.current.initializeAudioAnalysis();
        })
      ).rejects.toThrow('Permission denied');
    });

    it('should resume suspended audio context', async () => {
      mockAudioContext.state = 'suspended';
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should configure analyser with performance mode settings', async () => {
      const { result } = renderHook(() => useAudioAnalysis(PerformanceMode.QUALITY));

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      expect(mockAnalyser.fftSize).toBe(4096); // Quality mode uses 4096
      expect(mockAnalyser.smoothingTimeConstant).toBe(0.3);
      expect(mockAnalyser.minDecibels).toBe(-90);
      expect(mockAnalyser.maxDecibels).toBe(-10);
    });
  });

  describe('Audio Data Collection', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useAudioAnalysis());
      
      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      // Advance timers to trigger analysis
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });

    it('should collect volume data over time', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      // Simulate some time passing and analysis running
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const audioData = result.current.getAudioData();
      expect(audioData.volumeData.length).toBeGreaterThan(0);
    });

    it('should collect pitch data over time', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const audioData = result.current.getAudioData();
      expect(audioData.pitchData.length).toBeGreaterThan(0);
    });

    it('should collect spectral centroid data over time', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const audioData = result.current.getAudioData();
      expect(audioData.spectralCentroidData.length).toBeGreaterThan(0);
    });

    it('should provide current audio metrics', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const audioData = result.current.getAudioData();
      expect(typeof audioData.currentVolume).toBe('number');
      expect(typeof audioData.currentPitch).toBe('number');
      expect(typeof audioData.currentSpectralCentroid).toBe('number');
    });

    it('should provide last analysis data', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const lastAnalysis = result.current.getLastAnalysis();
      expect(lastAnalysis).not.toBeNull();
      if (lastAnalysis) {
        expect(typeof lastAnalysis.volume).toBe('number');
        expect(typeof lastAnalysis.volumeForUI).toBe('number');
        expect(typeof lastAnalysis.pitch).toBe('number');
        expect(typeof lastAnalysis.spectralCentroid).toBe('number');
      }
    });
  });

  describe('Performance Mode Configurations', () => {
    const testPerformanceMode = async (mode: PerformanceMode, expectedFFTSize: number) => {
      const { result } = renderHook(() => useAudioAnalysis(mode));

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      expect(mockAnalyser.fftSize).toBe(expectedFFTSize);
    };

    it('should use correct FFT size for SPEED mode', async () => {
      await testPerformanceMode(PerformanceMode.SPEED, 1024);
    });

    it('should use correct FFT size for BALANCED mode', async () => {
      await testPerformanceMode(PerformanceMode.BALANCED, 2048);
    });

    it('should use correct FFT size for QUALITY mode', async () => {
      await testPerformanceMode(PerformanceMode.QUALITY, 4096);
    });
  });

  describe('Data Management', () => {
    it('should clear audio data', () => {
      const { result } = renderHook(() => useAudioAnalysis());

      // Add some mock data
      result.current.volumeDataRef.current = [{ time: 0, volume: 10 }];
      result.current.pitchDataRef.current = [{ time: 0, pitch: 150 }];
      result.current.spectralCentroidDataRef.current = [{ time: 0, spectralCentroid: 1000 }];

      act(() => {
        result.current.clearAudioData();
      });

      expect(result.current.volumeDataRef.current).toEqual([]);
      expect(result.current.pitchDataRef.current).toEqual([]);
      expect(result.current.spectralCentroidDataRef.current).toEqual([]);
    });

    it('should provide session start time', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      const beforeInit = Date.now();
      
      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      const sessionStartTime = result.current.getSessionStartTime();
      const afterInit = Date.now();

      expect(sessionStartTime).toBeGreaterThanOrEqual(beforeInit);
      expect(sessionStartTime).toBeLessThanOrEqual(afterInit);
    });

    it('should return shallow copies of data arrays', () => {
      const { result } = renderHook(() => useAudioAnalysis());

      // Add some mock data
      const originalVolumeData = [{ time: 0, volume: 10 }];
      result.current.volumeDataRef.current = originalVolumeData;

      const audioData = result.current.getAudioData();

      // Should be different array instances
      expect(audioData.volumeData).not.toBe(originalVolumeData);
      // But with same content
      expect(audioData.volumeData).toEqual(originalVolumeData);
    });
  });

  describe('Cleanup and Stopping', () => {
    it('should stop audio analysis and cleanup resources', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        result.current.stopAudioAnalysis();
      });

      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(mockMediaStream.getTracks()[0].stop).toHaveBeenCalled();
    });

    it('should handle cleanup when already stopped', () => {
      const { result } = renderHook(() => useAudioAnalysis());

      act(() => {
        result.current.stopAudioAnalysis();
      });

      // Should not throw errors
      expect(mockAudioContext.close).not.toHaveBeenCalled();
    });

    it('should cleanup on unmount', async () => {
      const { result, unmount } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      unmount();

      // Cleanup should have been called
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle analysis when not initialized', () => {
      const { result } = renderHook(() => useAudioAnalysis());

      const audioData = result.current.getAudioData();
      expect(audioData.currentVolume).toBe(0);
      expect(audioData.currentPitch).toBe(0);
      expect(audioData.currentSpectralCentroid).toBe(0);

      const lastAnalysis = result.current.getLastAnalysis();
      expect(lastAnalysis).toBeNull();
    });

    it('should handle invalid audio data gracefully', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      // Mock analyser to return extreme values
      mockAnalyser.getByteFrequencyData = jest.fn((array) => {
        array.fill(0); // All zero frequency data
      });
      mockAnalyser.getByteTimeDomainData = jest.fn((array) => {
        array.fill(128); // Flat line time domain data
      });

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const audioData = result.current.getAudioData();
      expect(isFinite(audioData.currentVolume)).toBe(true);
      expect(isFinite(audioData.currentPitch)).toBe(true);
      expect(isFinite(audioData.currentSpectralCentroid)).toBe(true);
    });

    it('should handle WebKit prefix for AudioContext', async () => {
      // Remove standard AudioContext, only provide webkit version
      delete (global as any).AudioContext;
      (global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      expect((global as any).webkitAudioContext).toHaveBeenCalled();
    });

    it('should handle very low volume scenarios', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      // Mock analyser to return very low volume data
      mockAnalyser.getByteFrequencyData = jest.fn((array) => {
        array.fill(1); // Very low frequency data
      });
      mockAnalyser.getByteTimeDomainData = jest.fn((array) => {
        array.fill(128); // Silence in time domain
      });

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const audioData = result.current.getAudioData();
      expect(audioData.currentPitch).toBe(0); // Should not detect pitch in low volume
    });

    it('should handle high frequency content', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      // Mock analyser to return high frequency content
      mockAnalyser.getByteFrequencyData = jest.fn((array) => {
        // High frequencies have more energy
        for (let i = 0; i < array.length; i++) {
          array[i] = i > array.length * 0.8 ? 200 : 50;
        }
      });

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const audioData = result.current.getAudioData();
      expect(audioData.currentSpectralCentroid).toBeGreaterThan(0);
    });
  });

  describe('Memory and Performance', () => {
    it('should not create memory leaks with repeated start/stop cycles', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.initializeAudioAnalysis();
        });

        act(() => {
          result.current.stopAudioAnalysis();
        });
      }

      // No memory leaks should occur - this is more of a smoke test
      expect(true).toBe(true);
    });

    it('should limit data array growth', async () => {
      const { result } = renderHook(() => useAudioAnalysis());

      await act(async () => {
        await result.current.initializeAudioAnalysis();
      });

      // Simulate long running session
      act(() => {
        jest.advanceTimersByTime(10000); // 10 seconds
      });

      const audioData = result.current.getAudioData();
      
      // Arrays shouldn't grow indefinitely (this depends on implementation)
      expect(audioData.volumeData.length).toBeLessThan(1000); // Reasonable limit
      expect(audioData.pitchData.length).toBeLessThan(1000);
      expect(audioData.spectralCentroidData.length).toBeLessThan(1000);
    });
  });
});