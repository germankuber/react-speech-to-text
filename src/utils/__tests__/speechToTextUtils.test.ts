import {
  generateWordMetadata,
  generateSessionMetadata,
  getAverageVolumeData,
  getSpeechRateData,
  getAveragePitchData,
  generateChartData
} from '../speechToTextUtils';
import { SessionMetadata, WordMetadata } from '../../types/speechToText';

describe('speechToTextUtils', () => {
  const mockVolumeData = [
    { time: 0, volume: 10 },
    { time: 100, volume: 20 },
    { time: 200, volume: 15 },
    { time: 300, volume: 25 },
    { time: 400, volume: 30 }
  ];

  const mockPitchData = [
    { time: 0, pitch: 150 },
    { time: 100, pitch: 180 },
    { time: 200, pitch: 0 }, // Invalid pitch
    { time: 300, pitch: 200 },
    { time: 400, pitch: 160 }
  ];

  const mockSpectralCentroidData = [
    { time: 0, spectralCentroid: 1000 },
    { time: 100, spectralCentroid: 1200 },
    { time: 200, spectralCentroid: 0 }, // Invalid
    { time: 300, spectralCentroid: 1500 },
    { time: 400, spectralCentroid: 1100 }
  ];

  describe('generateWordMetadata', () => {
    it('should generate metadata for words with audio data', () => {
      const words = ['hello', 'world'];
      const duration = 1000;
      
      const result = generateWordMetadata(words, duration, mockVolumeData, mockPitchData, mockSpectralCentroidData);
      
      expect(result).toHaveLength(2);
      expect(result[0].word).toBe('hello');
      expect(result[0].startTime).toBe(0);
      expect(result[0].endTime).toBe(500);
      expect(result[1].word).toBe('world');
      expect(result[1].startTime).toBe(500);
      expect(result[1].endTime).toBe(1000);
    });

    it('should handle empty words array', () => {
      const result = generateWordMetadata([], 1000, mockVolumeData, mockPitchData, mockSpectralCentroidData);
      expect(result).toEqual([]);
    });

    it('should generate synthetic data when no audio data available', () => {
      const words = ['test'];
      const duration = 1000;
      
      const result = generateWordMetadata(words, duration, [], [], []);
      
      expect(result).toHaveLength(1);
      expect(result[0].word).toBe('test');
      expect(result[0].startVolume).toBeGreaterThan(0);
      expect(result[0].averagePitch).toBeGreaterThan(0);
      expect(result[0].averageSpectralCentroid).toBeGreaterThan(0);
    });

    it('should handle words with partial audio data', () => {
      const words = ['test'];
      const duration = 1000;
      const limitedVolumeData = [{ time: 100, volume: 15 }];
      
      const result = generateWordMetadata(words, duration, limitedVolumeData, mockPitchData, mockSpectralCentroidData);
      
      expect(result).toHaveLength(1);
      expect(result[0].averageVolume).toBeGreaterThan(0);
    });

    it('should filter invalid pitch and spectral centroid values', () => {
      const words = ['test'];
      const duration = 1000;
      const invalidPitchData = [
        { time: 0, pitch: 0 },
        { time: 100, pitch: -50 },
        { time: 200, pitch: 1000 }
      ];
      const invalidSpectralData = [
        { time: 0, spectralCentroid: 0 },
        { time: 100, spectralCentroid: 0 }
      ];
      
      const result = generateWordMetadata(words, duration, mockVolumeData, invalidPitchData, invalidSpectralData);
      
      // Should handle invalid values by using fallback logic
      expect(result[0]).toBeDefined();
      expect(typeof result[0].averagePitch).toBe('number');
      expect(typeof result[0].averageSpectralCentroid).toBe('number');
    });

    it('should calculate accurate volume statistics', () => {
      const words = ['test'];
      const duration = 500;
      const preciseVolumeData = [
        { time: 0, volume: 10 },
        { time: 100, volume: 20 },
        { time: 200, volume: 30 }
      ];
      
      const result = generateWordMetadata(words, duration, preciseVolumeData, [], []);
      
      expect(result[0].startVolume).toBe(10);
      expect(result[0].peakVolume).toBe(30);
      expect(result[0].minVolume).toBe(10);
      expect(result[0].averageVolume).toBe(20);
    });
  });

  describe('generateSessionMetadata', () => {
    it('should generate complete session metadata', () => {
      const words = ['hello', 'world'];
      const sessionStartTime = Date.now() - 1000;
      
      const result = generateSessionMetadata(words, sessionStartTime, mockVolumeData, mockPitchData, mockSpectralCentroidData);
      
      expect(result).toMatchObject({
        sessionStartTime,
        words: expect.any(Array),
        overallAverageVolume: expect.any(Number),
        overallPeakVolume: expect.any(Number),
        overallMinVolume: expect.any(Number),
        overallAveragePitch: expect.any(Number),
        overallPeakPitch: expect.any(Number),
        overallMinPitch: expect.any(Number)
      });
      
      expect(result.words).toHaveLength(2);
      expect(result.totalDuration).toBeGreaterThan(0);
    });

    it('should handle session with no words', () => {
      const sessionStartTime = Date.now() - 1000;
      
      const result = generateSessionMetadata([], sessionStartTime, mockVolumeData, mockPitchData, mockSpectralCentroidData);
      
      expect(result.words).toEqual([]);
      expect(result.overallAverageVolume).toBeGreaterThan(0);
    });

    it('should calculate correct overall statistics', () => {
      const words = ['test'];
      const sessionStartTime = Date.now() - 1000;
      const volumeData = [{ time: 0, volume: 15 }, { time: 100, volume: 25 }];
      
      const result = generateSessionMetadata(words, sessionStartTime, volumeData, [], []);
      
      expect(result.overallAverageVolume).toBe(20);
      expect(result.overallPeakVolume).toBe(25);
      expect(result.overallMinVolume).toBe(15);
    });
  });

  describe('getAverageVolumeData', () => {
    it('should bucket volume data by time intervals', () => {
      const volumeData = [
        { time: 0, volume: 10 },
        { time: 50, volume: 20 },
        { time: 150, volume: 30 },
        { time: 200, volume: 40 }
      ];
      
      const result = getAverageVolumeData(volumeData);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(bucket => {
        expect(bucket).toHaveProperty('time');
        expect(bucket).toHaveProperty('averageVolume');
        expect(typeof bucket.averageVolume).toBe('number');
      });
    });

    it('should handle empty volume data', () => {
      const result = getAverageVolumeData([]);
      expect(result).toEqual([]);
    });

    it('should respect session metadata time bounds', () => {
      const sessionMetadata: SessionMetadata = {
        sessionStartTime: 0,
        sessionEndTime: 1000,
        totalDuration: 1000,
        words: [{ word: 'test', startTime: 0, endTime: 500 } as WordMetadata],
        overallAverageVolume: 15,
        overallPeakVolume: 30,
        overallMinVolume: 5,
        overallAveragePitch: 150,
        overallPeakPitch: 200,
        overallMinPitch: 100,
        overallAverageSpectralCentroid: 1200,
        overallPeakSpectralCentroid: 1500,
        overallMinSpectralCentroid: 900
      };
      
      const volumeData = [
        { time: 0, volume: 10 },
        { time: 600, volume: 20 } // Beyond session end
      ];
      
      const result = getAverageVolumeData(volumeData, sessionMetadata);
      
      // Should only include data within session bounds
      expect(result.every(bucket => bucket.time <= 500)).toBe(true);
    });

    it('should calculate correct averages for buckets', () => {
      const volumeData = [
        { time: 0, volume: 10 },
        { time: 25, volume: 20 },
        { time: 50, volume: 30 }
      ];
      
      const result = getAverageVolumeData(volumeData);
      
      // All data should be in the same bucket (0-100ms)
      expect(result).toHaveLength(1);
      expect(result[0].averageVolume).toBe(20); // (10+20+30)/3
    });
  });

  describe('getSpeechRateData', () => {
    const mockSessionMetadata: SessionMetadata = {
      sessionStartTime: 0,
      sessionEndTime: 10000,
      totalDuration: 10000,
      words: [
        { word: 'hello', startTime: 0, endTime: 1000 } as WordMetadata,
        { word: 'world', startTime: 1000, endTime: 2000 } as WordMetadata,
        { word: 'test', startTime: 2000, endTime: 3000 } as WordMetadata,
        { word: 'speech', startTime: 3000, endTime: 4000 } as WordMetadata
      ],
      overallAverageVolume: 15,
      overallPeakVolume: 30,
      overallMinVolume: 5,
      overallAveragePitch: 150,
      overallPeakPitch: 200,
      overallMinPitch: 100,
      overallAverageSpectralCentroid: 1200,
      overallPeakSpectralCentroid: 1500,
      overallMinSpectralCentroid: 900
    };

    it('should calculate speech rate in words per minute', () => {
      const result = getSpeechRateData(mockSessionMetadata);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(dataPoint => {
        expect(dataPoint).toHaveProperty('time');
        expect(dataPoint).toHaveProperty('wpm');
        expect(dataPoint.wpm).toBeGreaterThan(0);
      });
    });

    it('should handle empty session metadata', () => {
      const emptySession: SessionMetadata = {
        ...mockSessionMetadata,
        words: []
      };
      
      const result = getSpeechRateData(emptySession);
      expect(result).toEqual([]);
    });

    it('should provide fallback data for sparse speech', () => {
      const sparseSession: SessionMetadata = {
        ...mockSessionMetadata,
        words: [{ word: 'single', startTime: 0, endTime: 1000 } as WordMetadata]
      };
      
      const result = getSpeechRateData(sparseSession);
      
      // Should provide fallback data points
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].wpm).toBeGreaterThan(0);
    });

    it('should use sliding window for rate calculation', () => {
      const result = getSpeechRateData(mockSessionMetadata);
      
      // Each data point should represent a different time window
      for (let i = 1; i < result.length; i++) {
        expect(result[i].time).toBeGreaterThan(result[i-1].time);
      }
    });
  });

  describe('getAveragePitchData', () => {
    it('should bucket pitch data by time intervals', () => {
      const pitchData = [
        { time: 0, pitch: 150 },
        { time: 50, pitch: 160 },
        { time: 150, pitch: 170 },
        { time: 200, pitch: 180 }
      ];
      
      const result = getAveragePitchData(pitchData);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(bucket => {
        expect(bucket).toHaveProperty('time');
        expect(bucket).toHaveProperty('averagePitch');
        expect(typeof bucket.averagePitch).toBe('number');
      });
    });

    it('should filter out invalid pitch values', () => {
      const pitchData = [
        { time: 0, pitch: 150 },
        { time: 50, pitch: 0 }, // Invalid
        { time: 100, pitch: 160 }
      ];
      
      const result = getAveragePitchData(pitchData);
      
      // Should only include valid pitch values in calculations
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty pitch data', () => {
      const result = getAveragePitchData([]);
      expect(result).toEqual([]);
    });

    it('should calculate correct averages for pitch buckets', () => {
      const pitchData = [
        { time: 0, pitch: 100 },
        { time: 25, pitch: 200 },
        { time: 50, pitch: 300 }
      ];
      
      const result = getAveragePitchData(pitchData);
      
      expect(result).toHaveLength(1);
      expect(result[0].averagePitch).toBe(200); // (100+200+300)/3
    });
  });

  describe('generateChartData', () => {
    it('should generate complete chart data structure', () => {
      const sessionMetadata: SessionMetadata = {
        sessionStartTime: 0,
        sessionEndTime: 1000,
        totalDuration: 1000,
        words: [{ word: 'test', startTime: 0, endTime: 1000 } as WordMetadata],
        overallAverageVolume: 15,
        overallPeakVolume: 30,
        overallMinVolume: 5,
        overallAveragePitch: 150,
        overallPeakPitch: 200,
        overallMinPitch: 100,
        overallAverageSpectralCentroid: 1200,
        overallPeakSpectralCentroid: 1500,
        overallMinSpectralCentroid: 900
      };
      
      const result = generateChartData(mockVolumeData, mockPitchData, sessionMetadata);
      
      expect(result).toHaveProperty('volumeData');
      expect(result).toHaveProperty('pitchData');
      expect(result).toHaveProperty('speechRateData');
      
      expect(Array.isArray(result.volumeData)).toBe(true);
      expect(Array.isArray(result.pitchData)).toBe(true);
      expect(Array.isArray(result.speechRateData)).toBe(true);
    });

    it('should handle missing session metadata', () => {
      const result = generateChartData(mockVolumeData, mockPitchData);
      
      expect(result.volumeData).toBeDefined();
      expect(result.pitchData).toBeDefined();
      expect(result.speechRateData).toEqual([]);
    });

    it('should handle empty input data', () => {
      const result = generateChartData([], []);
      
      expect(result.volumeData).toEqual([]);
      expect(result.pitchData).toEqual([]);
      expect(result.speechRateData).toEqual([]);
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeVolumeData = Array.from({ length: 10000 }, (_, i) => ({
        time: i * 10,
        volume: Math.random() * 100
      }));
      
      const largeWords = Array.from({ length: 100 }, (_, i) => `word${i}`);
      
      const start = performance.now();
      const result = generateWordMetadata(largeWords, 100000, largeVolumeData, [], []);
      const end = performance.now();
      
      expect(result).toHaveLength(100);
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle extreme volume values', () => {
      const extremeVolumeData = [
        { time: 0, volume: 0 },
        { time: 100, volume: 50 },
        { time: 200, volume: 100 }
      ];
      
      const result = generateWordMetadata(['test'], 1000, extremeVolumeData, [], []);
      
      expect(result).toHaveLength(1);
      expect(isFinite(result[0].averageVolume)).toBe(true);
      expect(isFinite(result[0].peakVolume)).toBe(true);
      expect(isFinite(result[0].minVolume)).toBe(true);
    });

    it('should handle zero duration gracefully', () => {
      const result = generateWordMetadata(['test'], 0, mockVolumeData, mockPitchData, mockSpectralCentroidData);
      
      expect(result).toHaveLength(1);
      expect(result[0].startTime).toBe(0);
      expect(result[0].endTime).toBe(0);
    });

    it('should handle duplicate time values', () => {
      const duplicateTimeData = [
        { time: 100, volume: 10 },
        { time: 100, volume: 20 },
        { time: 100, volume: 30 }
      ];
      
      const result = getAverageVolumeData(duplicateTimeData);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].averageVolume).toBe(20); // Should average all values
    });
  });
});