import {
  PerformanceMode,
  SpeechToTextConfig,
  WordMetadata,
  SessionMetadata,
  AudioMetrics,
  ChartData,
  SilenceDetectedData,
  SpeechStartData,
  SpeechEndData,
  SpeechErrorData,
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from '../speechToText';

describe('TypeScript Types and Interfaces', () => {
  describe('PerformanceMode Enum', () => {
    it('should have correct enum values', () => {
      expect(PerformanceMode.SPEED).toBe('speed');
      expect(PerformanceMode.BALANCED).toBe('balanced');
      expect(PerformanceMode.QUALITY).toBe('quality');
    });

    it('should allow assignment from enum values', () => {
      const mode1: PerformanceMode = PerformanceMode.SPEED;
      const mode2: PerformanceMode = PerformanceMode.BALANCED;
      const mode3: PerformanceMode = PerformanceMode.QUALITY;

      expect(mode1).toBeDefined();
      expect(mode2).toBeDefined();
      expect(mode3).toBeDefined();
    });
  });

  describe('SpeechToTextConfig Interface', () => {
    it('should allow empty configuration', () => {
      const config: SpeechToTextConfig = {};
      expect(config).toBeDefined();
    });

    it('should allow partial configuration', () => {
      const config: SpeechToTextConfig = {
        language: 'en-US',
        silenceTimeout: 1000
      };
      expect(config.language).toBe('en-US');
      expect(config.silenceTimeout).toBe(1000);
    });

    it('should allow full configuration', () => {
      const onSpeechCompleted = jest.fn();
      const onVoiceStart = jest.fn();
      const onSpeechEnd = jest.fn();
      const onError = jest.fn();

      const config: SpeechToTextConfig = {
        language: 'es-ES',
        silenceTimeout: 700,
        optimizedMode: true,
        performanceMode: PerformanceMode.BALANCED,
        audioConfig: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        onSpeechCompleted,
        onVoiceStart,
        onSpeechEnd,
        onError,
        speechVolumeThreshold: 15,
        speechPauseThreshold: 200
      };

      expect(config).toMatchObject({
        language: 'es-ES',
        silenceTimeout: 700,
        optimizedMode: true,
        performanceMode: PerformanceMode.BALANCED,
        speechVolumeThreshold: 15,
        speechPauseThreshold: 200
      });
      expect(typeof config.onSpeechCompleted).toBe('function');
      expect(typeof config.onVoiceStart).toBe('function');
      expect(typeof config.onSpeechEnd).toBe('function');
      expect(typeof config.onError).toBe('function');
    });

    it('should allow audio config variations', () => {
      const config1: SpeechToTextConfig = {
        audioConfig: {}
      };

      const config2: SpeechToTextConfig = {
        audioConfig: {
          echoCancellation: true
        }
      };

      const config3: SpeechToTextConfig = {
        audioConfig: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: false
        }
      };

      expect(config1.audioConfig).toEqual({});
      expect(config2.audioConfig?.echoCancellation).toBe(true);
      expect(config3.audioConfig?.noiseSuppression).toBe(true);
    });
  });

  describe('WordMetadata Interface', () => {
    it('should enforce required properties', () => {
      const wordMetadata: WordMetadata = {
        word: 'hello',
        startTime: 0,
        endTime: 500,
        startVolume: 10.5,
        endVolume: 12.3,
        peakVolume: 15.7,
        minVolume: 8.2,
        averageVolume: 11.9,
        startPitch: 150.5,
        endPitch: 160.2,
        peakPitch: 180.0,
        minPitch: 140.1,
        averagePitch: 155.8,
        startSpectralCentroid: 1200.5,
        endSpectralCentroid: 1300.2,
        peakSpectralCentroid: 1500.0,
        minSpectralCentroid: 1000.1,
        averageSpectralCentroid: 1250.8
      };

      expect(wordMetadata.word).toBe('hello');
      expect(wordMetadata.startTime).toBe(0);
      expect(wordMetadata.endTime).toBe(500);
      expect(typeof wordMetadata.startVolume).toBe('number');
      expect(typeof wordMetadata.averagePitch).toBe('number');
      expect(typeof wordMetadata.averageSpectralCentroid).toBe('number');
    });

    it('should allow numeric precision for measurements', () => {
      const wordMetadata: WordMetadata = {
        word: 'test',
        startTime: 0,
        endTime: 1,
        startVolume: 15.123456,
        endVolume: 16.789012,
        peakVolume: 20.555555,
        minVolume: 10.111111,
        averageVolume: 15.666666,
        startPitch: 150.1,
        endPitch: 155.9,
        peakPitch: 200.0,
        minPitch: 100.5,
        averagePitch: 175.25,
        startSpectralCentroid: 1234.56789,
        endSpectralCentroid: 1345.67890,
        peakSpectralCentroid: 1500.12345,
        minSpectralCentroid: 1000.54321,
        averageSpectralCentroid: 1270.27777
      };

      // Should accept precise decimal values
      expect(wordMetadata.startVolume).toBeCloseTo(15.123456, 5);
      expect(wordMetadata.startPitch).toBeCloseTo(150.1, 1);
      expect(wordMetadata.startSpectralCentroid).toBeCloseTo(1234.56789, 4);
    });
  });

  describe('SessionMetadata Interface', () => {
    it('should enforce complete session metadata structure', () => {
      const words: WordMetadata[] = [
        {
          word: 'hello',
          startTime: 0,
          endTime: 500,
          startVolume: 10,
          endVolume: 12,
          peakVolume: 15,
          minVolume: 8,
          averageVolume: 11,
          startPitch: 150,
          endPitch: 160,
          peakPitch: 180,
          minPitch: 140,
          averagePitch: 155,
          startSpectralCentroid: 1200,
          endSpectralCentroid: 1300,
          peakSpectralCentroid: 1500,
          minSpectralCentroid: 1000,
          averageSpectralCentroid: 1250
        }
      ];

      const sessionMetadata: SessionMetadata = {
        sessionStartTime: Date.now() - 5000,
        sessionEndTime: Date.now(),
        totalDuration: 5000,
        words,
        overallAverageVolume: 15.5,
        overallPeakVolume: 25.0,
        overallMinVolume: 5.2,
        overallAveragePitch: 165.8,
        overallPeakPitch: 220.0,
        overallMinPitch: 120.5,
        overallAverageSpectralCentroid: 1350.5,
        overallPeakSpectralCentroid: 1800.0,
        overallMinSpectralCentroid: 900.2
      };

      expect(sessionMetadata.words).toHaveLength(1);
      expect(sessionMetadata.totalDuration).toBe(5000);
      expect(sessionMetadata.overallAverageVolume).toBeCloseTo(15.5, 1);
      expect(sessionMetadata.overallAveragePitch).toBeCloseTo(165.8, 1);
      expect(sessionMetadata.overallAverageSpectralCentroid).toBeCloseTo(1350.5, 1);
    });

    it('should allow empty words array', () => {
      const sessionMetadata: SessionMetadata = {
        sessionStartTime: 0,
        sessionEndTime: 1000,
        totalDuration: 1000,
        words: [],
        overallAverageVolume: 0,
        overallPeakVolume: 0,
        overallMinVolume: 0,
        overallAveragePitch: 0,
        overallPeakPitch: 0,
        overallMinPitch: 0,
        overallAverageSpectralCentroid: 0,
        overallPeakSpectralCentroid: 0,
        overallMinSpectralCentroid: 0
      };

      expect(sessionMetadata.words).toEqual([]);
    });
  });

  describe('AudioMetrics Interface', () => {
    it('should enforce audio metrics structure', () => {
      const audioMetrics: AudioMetrics = {
        currentVolume: 25.5,
        currentPitch: 175.2,
        currentSpectralCentroid: 1425.8,
        volumeData: [
          { time: 0, volume: 20 },
          { time: 100, volume: 25 },
          { time: 200, volume: 30 }
        ],
        pitchData: [
          { time: 0, pitch: 150 },
          { time: 100, pitch: 175 },
          { time: 200, pitch: 0 }
        ],
        spectralCentroidData: [
          { time: 0, spectralCentroid: 1200 },
          { time: 100, spectralCentroid: 1400 },
          { time: 200, spectralCentroid: 0 }
        ]
      };

      expect(audioMetrics.currentVolume).toBeCloseTo(25.5, 1);
      expect(audioMetrics.currentPitch).toBeCloseTo(175.2, 1);
      expect(audioMetrics.currentSpectralCentroid).toBeCloseTo(1425.8, 1);
      expect(audioMetrics.volumeData).toHaveLength(3);
      expect(audioMetrics.pitchData).toHaveLength(3);
      expect(audioMetrics.spectralCentroidData).toHaveLength(3);
    });

    it('should allow empty data arrays', () => {
      const audioMetrics: AudioMetrics = {
        currentVolume: 0,
        currentPitch: 0,
        currentSpectralCentroid: 0,
        volumeData: [],
        pitchData: [],
        spectralCentroidData: []
      };

      expect(audioMetrics.volumeData).toEqual([]);
      expect(audioMetrics.pitchData).toEqual([]);
      expect(audioMetrics.spectralCentroidData).toEqual([]);
    });
  });

  describe('ChartData Interface', () => {
    it('should enforce chart data structure', () => {
      const chartData: ChartData = {
        volumeData: [
          { time: 0, averageVolume: 15.5 },
          { time: 100, averageVolume: 18.2 }
        ],
        pitchData: [
          { time: 0, averagePitch: 150.5 },
          { time: 100, averagePitch: 165.8 }
        ],
        speechRateData: [
          { time: 2000, wpm: 120.5 },
          { time: 4000, wpm: 135.2 }
        ]
      };

      expect(chartData.volumeData).toHaveLength(2);
      expect(chartData.pitchData).toHaveLength(2);
      expect(chartData.speechRateData).toHaveLength(2);
      
      expect(chartData.volumeData[0]).toHaveProperty('time');
      expect(chartData.volumeData[0]).toHaveProperty('averageVolume');
      expect(chartData.pitchData[0]).toHaveProperty('averagePitch');
      expect(chartData.speechRateData[0]).toHaveProperty('wpm');
    });
  });

  describe('Callback Data Interfaces', () => {
    it('should enforce SilenceDetectedData structure', () => {
      const mockAudioMetrics: AudioMetrics = {
        currentVolume: 15,
        currentPitch: 150,
        currentSpectralCentroid: 1200,
        volumeData: [],
        pitchData: [],
        spectralCentroidData: []
      };

      const silenceData: SilenceDetectedData = {
        silenceDetectedAt: Date.now(),
        silenceTimeout: 700,
        timeSinceLastSpeech: 800,
        currentTranscript: 'hello world',
        currentInterimTranscript: 'testing',
        currentAudioMetrics: mockAudioMetrics
      };

      expect(typeof silenceData.silenceDetectedAt).toBe('number');
      expect(silenceData.silenceTimeout).toBe(700);
      expect(silenceData.timeSinceLastSpeech).toBe(800);
      expect(silenceData.currentTranscript).toBe('hello world');
      expect(silenceData.currentAudioMetrics).toBe(mockAudioMetrics);
    });

    it('should enforce SpeechStartData structure', () => {
      const mockAudioMetrics: AudioMetrics = {
        currentVolume: 25,
        currentPitch: 175,
        currentSpectralCentroid: 1400,
        volumeData: [],
        pitchData: [],
        spectralCentroidData: []
      };

      const speechStartData: SpeechStartData = {
        speechStartedAt: Date.now(),
        triggerVolume: 25.5,
        startPitch: 175.2,
        currentAudioMetrics: mockAudioMetrics
      };

      expect(typeof speechStartData.speechStartedAt).toBe('number');
      expect(speechStartData.triggerVolume).toBeCloseTo(25.5, 1);
      expect(speechStartData.startPitch).toBeCloseTo(175.2, 1);
      expect(speechStartData.currentAudioMetrics).toBe(mockAudioMetrics);
    });

    it('should enforce SpeechEndData structure', () => {
      const mockAudioMetrics: AudioMetrics = {
        currentVolume: 10,
        currentPitch: 0,
        currentSpectralCentroid: 900,
        volumeData: [],
        pitchData: [],
        spectralCentroidData: []
      };

      const speechEndData: SpeechEndData = {
        speechEndedAt: Date.now(),
        pauseDuration: 250,
        endVolume: 10.5,
        endPitch: 0,
        currentTranscript: 'final transcript',
        currentInterimTranscript: '',
        currentAudioMetrics: mockAudioMetrics
      };

      expect(typeof speechEndData.speechEndedAt).toBe('number');
      expect(speechEndData.pauseDuration).toBe(250);
      expect(speechEndData.endVolume).toBeCloseTo(10.5, 1);
      expect(speechEndData.endPitch).toBe(0);
      expect(speechEndData.currentTranscript).toBe('final transcript');
      expect(speechEndData.currentAudioMetrics).toBe(mockAudioMetrics);
    });

    it('should enforce SpeechErrorData structure', () => {
      const mockAudioMetrics: AudioMetrics = {
        currentVolume: 5,
        currentPitch: 0,
        currentSpectralCentroid: 800,
        volumeData: [],
        pitchData: [],
        spectralCentroidData: []
      };

      const errorData: SpeechErrorData = {
        errorOccurredAt: Date.now(),
        errorType: 'network',
        errorMessage: 'Network connection failed',
        isCritical: true,
        currentTranscript: 'partial transcript',
        currentInterimTranscript: 'interim text',
        currentAudioMetrics: mockAudioMetrics,
        willAttemptRestart: false
      };

      expect(typeof errorData.errorOccurredAt).toBe('number');
      expect(errorData.errorType).toBe('network');
      expect(errorData.errorMessage).toBe('Network connection failed');
      expect(errorData.isCritical).toBe(true);
      expect(errorData.willAttemptRestart).toBe(false);
      expect(errorData.currentAudioMetrics).toBe(mockAudioMetrics);
    });
  });

  describe('Speech Recognition Interfaces', () => {
    it('should enforce SpeechRecognitionEvent structure', () => {
      const mockResults: any = {
        length: 2,
        0: {
          isFinal: true,
          0: { transcript: 'hello' }
        },
        1: {
          isFinal: false,
          0: { transcript: 'world' }
        }
      };

      const event: SpeechRecognitionEvent = {
        results: mockResults,
        resultIndex: 1,
        type: 'result',
        target: null,
        currentTarget: null,
        eventPhase: 2,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        composed: false,
        isTrusted: true,
        timeStamp: Date.now(),
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        stopPropagation: jest.fn(),
        composedPath: jest.fn(() => []),
        initEvent: jest.fn()
      };

      expect(event.results).toBe(mockResults);
      expect(event.resultIndex).toBe(1);
      expect(event.type).toBe('result');
    });

    it('should enforce SpeechRecognitionErrorEvent structure', () => {
      const errorEvent: SpeechRecognitionErrorEvent = {
        error: 'network',
        message: 'Network error occurred',
        type: 'error',
        target: null,
        currentTarget: null,
        eventPhase: 2,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        composed: false,
        isTrusted: true,
        timeStamp: Date.now(),
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        stopPropagation: jest.fn(),
        composedPath: jest.fn(() => []),
        initEvent: jest.fn()
      };

      expect(errorEvent.error).toBe('network');
      expect(errorEvent.message).toBe('Network error occurred');
      expect(errorEvent.type).toBe('error');
    });

    it('should enforce SpeechRecognition interface', () => {
      const recognition: SpeechRecognition = {
        continuous: true,
        interimResults: true,
        lang: 'en-US',
        maxAlternatives: 3,
        serviceURI: 'https://example.com/speech',
        start: jest.fn(),
        stop: jest.fn(),
        abort: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(() => true)
      };

      expect(recognition.continuous).toBe(true);
      expect(recognition.interimResults).toBe(true);
      expect(recognition.lang).toBe('en-US');
      expect(recognition.maxAlternatives).toBe(3);
      expect(typeof recognition.start).toBe('function');
      expect(typeof recognition.stop).toBe('function');
      expect(typeof recognition.abort).toBe('function');
    });
  });

  describe('Type Compatibility and Unions', () => {
    it('should allow PerformanceMode string values', () => {
      const mode1: PerformanceMode = 'speed' as PerformanceMode;
      const mode2: PerformanceMode = 'balanced' as PerformanceMode;
      const mode3: PerformanceMode = 'quality' as PerformanceMode;

      expect([mode1, mode2, mode3]).toEqual(['speed', 'balanced', 'quality']);
    });

    it('should enforce callback function signatures', () => {
      const onSpeechCompleted = (data: SilenceDetectedData): void => {
        expect(data.silenceDetectedAt).toBeGreaterThan(0);
        expect(typeof data.currentTranscript).toBe('string');
      };

      const onVoiceStart = (data: SpeechStartData): void => {
        expect(data.speechStartedAt).toBeGreaterThan(0);
        expect(typeof data.triggerVolume).toBe('number');
      };

      const onSpeechEnd = (data: SpeechEndData): void => {
        expect(data.speechEndedAt).toBeGreaterThan(0);
        expect(typeof data.pauseDuration).toBe('number');
      };

      const onError = (data: SpeechErrorData): void => {
        expect(data.errorOccurredAt).toBeGreaterThan(0);
        expect(typeof data.errorType).toBe('string');
        expect(typeof data.isCritical).toBe('boolean');
      };

      // These functions should match the expected signatures
      expect(typeof onSpeechCompleted).toBe('function');
      expect(typeof onVoiceStart).toBe('function');
      expect(typeof onSpeechEnd).toBe('function');
      expect(typeof onError).toBe('function');
    });

    it('should allow optional configuration properties', () => {
      const configs: SpeechToTextConfig[] = [
        {},
        { language: 'en-US' },
        { silenceTimeout: 1000 },
        { performanceMode: PerformanceMode.QUALITY },
        {
          language: 'es-ES',
          silenceTimeout: 800,
          optimizedMode: false,
          performanceMode: PerformanceMode.BALANCED
        }
      ];

      configs.forEach(config => {
        expect(config).toBeDefined();
      });
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle extreme numeric values', () => {
      const extremeWordMetadata: WordMetadata = {
        word: 'extreme',
        startTime: 0,
        endTime: Number.MAX_SAFE_INTEGER,
        startVolume: -Infinity,
        endVolume: Infinity,
        peakVolume: Number.MAX_VALUE,
        minVolume: Number.MIN_VALUE,
        averageVolume: NaN,
        startPitch: 0,
        endPitch: 22000,
        peakPitch: 20000,
        minPitch: 20,
        averagePitch: 440,
        startSpectralCentroid: 0,
        endSpectralCentroid: 22050,
        peakSpectralCentroid: 20000,
        minSpectralCentroid: 0,
        averageSpectralCentroid: 2000
      };

      // Type system should accept these values
      expect(extremeWordMetadata.word).toBe('extreme');
      expect(extremeWordMetadata.endTime).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle empty and special string values', () => {
      const wordMetadata: WordMetadata = {
        word: '', // Empty string
        startTime: 0,
        endTime: 1,
        startVolume: 0,
        endVolume: 0,
        peakVolume: 0,
        minVolume: 0,
        averageVolume: 0,
        startPitch: 0,
        endPitch: 0,
        peakPitch: 0,
        minPitch: 0,
        averagePitch: 0,
        startSpectralCentroid: 0,
        endSpectralCentroid: 0,
        peakSpectralCentroid: 0,
        minSpectralCentroid: 0,
        averageSpectralCentroid: 0
      };

      const specialStrings: WordMetadata[] = [
        { ...wordMetadata, word: ' ' }, // Space
        { ...wordMetadata, word: '\n' }, // Newline
        { ...wordMetadata, word: '\t' }, // Tab
        { ...wordMetadata, word: '🎤' }, // Emoji
        { ...wordMetadata, word: 'café' }, // Accented characters
        { ...wordMetadata, word: '测试' } // Unicode
      ];

      specialStrings.forEach(metadata => {
        expect(typeof metadata.word).toBe('string');
      });
    });

    it('should handle array length edge cases', () => {
      // Very large arrays
      const largeVolumeData = Array.from({ length: 10000 }, (_, i) => ({
        time: i * 10,
        volume: Math.random() * 100
      }));

      const audioMetrics: AudioMetrics = {
        currentVolume: 50,
        currentPitch: 150,
        currentSpectralCentroid: 1200,
        volumeData: largeVolumeData,
        pitchData: [],
        spectralCentroidData: []
      };

      expect(audioMetrics.volumeData.length).toBe(10000);
      expect(audioMetrics.pitchData.length).toBe(0);
    });
  });
});