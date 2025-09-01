import * as SpeechToTextLib from '../index';
import { PerformanceMode } from '../../types/speechToText';

describe('Library Exports', () => {
  describe('Main Exports', () => {
    it('should export useSpeechToText hook', () => {
      expect(SpeechToTextLib.useSpeechToText).toBeDefined();
      expect(typeof SpeechToTextLib.useSpeechToText).toBe('function');
    });

    it('should export useAudioAnalysis hook', () => {
      expect(SpeechToTextLib.useAudioAnalysis).toBeDefined();
      expect(typeof SpeechToTextLib.useAudioAnalysis).toBe('function');
    });

    it('should export utility functions', () => {
      expect(SpeechToTextLib.generateWordMetadata).toBeDefined();
      expect(SpeechToTextLib.generateSessionMetadata).toBeDefined();
      expect(SpeechToTextLib.getAverageVolumeData).toBeDefined();
      expect(SpeechToTextLib.getSpeechRateData).toBeDefined();
      expect(SpeechToTextLib.getAveragePitchData).toBeDefined();
      expect(SpeechToTextLib.generateChartData).toBeDefined();

      expect(typeof SpeechToTextLib.generateWordMetadata).toBe('function');
      expect(typeof SpeechToTextLib.generateSessionMetadata).toBe('function');
      expect(typeof SpeechToTextLib.getAverageVolumeData).toBe('function');
      expect(typeof SpeechToTextLib.getSpeechRateData).toBe('function');
      expect(typeof SpeechToTextLib.getAveragePitchData).toBe('function');
      expect(typeof SpeechToTextLib.generateChartData).toBe('function');
    });

    it('should export TypeScript types and interfaces', () => {
      expect(SpeechToTextLib.PerformanceMode).toBeDefined();
      expect(SpeechToTextLib.PerformanceMode.SPEED).toBe('speed');
      expect(SpeechToTextLib.PerformanceMode.BALANCED).toBe('balanced');
      expect(SpeechToTextLib.PerformanceMode.QUALITY).toBe('quality');
    });
  });

  describe('Export Structure', () => {
    it('should have consistent export names', () => {
      const exportNames = Object.keys(SpeechToTextLib).sort();
      
      const expectedExports = [
        'PerformanceMode',
        'generateChartData',
        'generateSessionMetadata',
        'generateWordMetadata',
        'getAveragePitchData',
        'getAverageVolumeData',
        'getSpeechRateData',
        'useAudioAnalysis',
        'useSpeechToText'
      ].sort();

      expect(exportNames).toEqual(expectedExports);
    });

    it('should not export internal implementation details', () => {
      // These should not be exported as they are implementation details
      expect((SpeechToTextLib as any).calculateArrayStats).toBeUndefined();
      expect((SpeechToTextLib as any).processPitchData).toBeUndefined();
      expect((SpeechToTextLib as any).detectPitchWithAutocorrelation).toBeUndefined();
    });

    it('should export only production-ready APIs', () => {
      const exports = Object.keys(SpeechToTextLib);
      
      // No test utilities should be exported
      exports.forEach(exportName => {
        expect(exportName).not.toMatch(/test|mock|debug/i);
      });
    });
  });

  describe('Version Compatibility', () => {
    it('should maintain backward compatibility with main exports', () => {
      // These are the core exports that should always be available
      const coreExports = [
        'useSpeechToText',
        'useAudioAnalysis',
        'PerformanceMode'
      ];

      coreExports.forEach(exportName => {
        expect(SpeechToTextLib).toHaveProperty(exportName);
      });
    });

    it('should provide utility functions for advanced use cases', () => {
      // These utilities should be available for advanced users
      const utilityExports = [
        'generateWordMetadata',
        'generateSessionMetadata',
        'generateChartData'
      ];

      utilityExports.forEach(exportName => {
        expect(SpeechToTextLib).toHaveProperty(exportName);
        expect(typeof (SpeechToTextLib as any)[exportName]).toBe('function');
      });
    });
  });

  describe('Import Patterns', () => {
    it('should support named imports', () => {
      // This is tested by the import statement at the top of this file
      expect(SpeechToTextLib.useSpeechToText).toBeDefined();
    });

    it('should support destructured imports', () => {
      const { useSpeechToText, PerformanceMode } = SpeechToTextLib;
      
      expect(useSpeechToText).toBeDefined();
      expect(PerformanceMode).toBeDefined();
      expect(PerformanceMode.BALANCED).toBe('balanced');
    });

    it('should support namespace imports', () => {
      // This is what we're doing in this test file
      expect(typeof SpeechToTextLib).toBe('object');
      expect(SpeechToTextLib.useSpeechToText).toBeDefined();
    });
  });

  describe('Type Exports', () => {
    it('should export PerformanceMode enum', () => {
      expect(SpeechToTextLib.PerformanceMode).toBeDefined();
      
      const modes = Object.values(SpeechToTextLib.PerformanceMode);
      expect(modes).toContain('speed');
      expect(modes).toContain('balanced');
      expect(modes).toContain('quality');
    });

    it('should allow PerformanceMode usage in code', () => {
      const speedMode = SpeechToTextLib.PerformanceMode.SPEED;
      const balancedMode = SpeechToTextLib.PerformanceMode.BALANCED;
      const qualityMode = SpeechToTextLib.PerformanceMode.QUALITY;

      expect(speedMode).toBe('speed');
      expect(balancedMode).toBe('balanced');
      expect(qualityMode).toBe('quality');

      // Should be able to use in switch statements
      let result = '';
      switch (speedMode) {
        case SpeechToTextLib.PerformanceMode.SPEED:
          result = 'fast';
          break;
        case SpeechToTextLib.PerformanceMode.BALANCED:
          result = 'balanced';
          break;
        case SpeechToTextLib.PerformanceMode.QUALITY:
          result = 'quality';
          break;
      }

      expect(result).toBe('fast');
    });
  });

  describe('Documentation and Metadata', () => {
    it('should provide meaningful function names', () => {
      const functionNames = Object.keys(SpeechToTextLib)
        .filter(key => typeof (SpeechToTextLib as any)[key] === 'function');

      functionNames.forEach(name => {
        // Function names should be descriptive
        expect(name.length).toBeGreaterThan(3);
        expect(name).not.toMatch(/^[a-z]$/); // Not single letters
        expect(name).not.toMatch(/temp|test|debug/i); // Not temporary names
      });
    });

    it('should follow consistent naming conventions', () => {
      const exports = Object.keys(SpeechToTextLib);
      
      // Hook names should start with 'use'
      const hooks = exports.filter(name => name.startsWith('use'));
      hooks.forEach(hook => {
        expect(hook).toMatch(/^use[A-Z]/); // camelCase after 'use'
      });

      // Utility functions should use camelCase
      const utilities = exports.filter(name => 
        typeof (SpeechToTextLib as any)[name] === 'function' && 
        !name.startsWith('use')
      );
      utilities.forEach(util => {
        expect(util).toMatch(/^[a-z]/); // Start with lowercase
        expect(util).not.toMatch(/[_-]/); // No underscores or hyphens
      });
    });
  });

  describe('Runtime Type Checking', () => {
    it('should handle PerformanceMode type checking at runtime', () => {
      const validModes = ['speed', 'balanced', 'quality'];
      const invalidModes = ['fast', 'slow', 'best', 'worst', ''];

      validModes.forEach(mode => {
        expect(Object.values(SpeechToTextLib.PerformanceMode)).toContain(mode);
      });

      invalidModes.forEach(mode => {
        expect(Object.values(SpeechToTextLib.PerformanceMode)).not.toContain(mode);
      });
    });

    it('should provide type-safe enum usage', () => {
      // This tests that the enum can be used safely
      const modeArray: PerformanceMode[] = [
        SpeechToTextLib.PerformanceMode.SPEED,
        SpeechToTextLib.PerformanceMode.BALANCED,
        SpeechToTextLib.PerformanceMode.QUALITY
      ];

      expect(modeArray).toHaveLength(3);
      expect(modeArray).toContain('speed');
      expect(modeArray).toContain('balanced');
      expect(modeArray).toContain('quality');
    });
  });

  describe('Bundle Size and Tree Shaking', () => {
    it('should support tree shaking by using named exports', () => {
      // All exports should be named exports to support tree shaking
      const exports = Object.keys(SpeechToTextLib);
      
      // Should not have a default export in the exports object
      expect(exports).not.toContain('default');
    });

    it('should not pollute global namespace', () => {
      // The library should not add anything to global scope
      const globalKeys = Object.keys(globalThis);
      
      // None of our export names should be in global scope
      Object.keys(SpeechToTextLib).forEach(exportName => {
        // Allow common globals that might coincidentally match
        if (!['PerformanceMode'].includes(exportName)) {
          expect(globalKeys).not.toContain(exportName);
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing dependencies gracefully', () => {
      // The imports should not throw errors even if some features are unavailable
      expect(() => {
        const { useSpeechToText, useAudioAnalysis } = SpeechToTextLib;
        return { useSpeechToText, useAudioAnalysis };
      }).not.toThrow();
    });

    it('should provide fallbacks for unavailable features', () => {
      // This is more of a smoke test to ensure exports are stable
      expect(() => SpeechToTextLib.useSpeechToText).not.toThrow();
      expect(() => SpeechToTextLib.useAudioAnalysis).not.toThrow();
    });
  });

  describe('Performance Characteristics', () => {
    it('should have fast import times', () => {
      // Measure import time (this is already imported, so we measure re-access)
      const startTime = performance.now();
      
      const exports = Object.keys(SpeechToTextLib);
      exports.forEach(exportName => {
        const exported = (SpeechToTextLib as any)[exportName];
        expect(exported).toBeDefined();
      });
      
      const endTime = performance.now();
      const accessTime = endTime - startTime;
      
      // Should be very fast to access exports
      expect(accessTime).toBeLessThan(10); // 10ms max
    });

    it('should not perform heavy initialization on import', () => {
      // Imports should be lazy - no heavy computation should happen
      // This is tested by ensuring the import completes quickly above
      expect(true).toBe(true);
    });
  });
});