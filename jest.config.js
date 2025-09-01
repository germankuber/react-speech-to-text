export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ESNext',
        target: 'ES2020'
      }
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(pitchy|fft.js)/)'
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|js)',
    '<rootDir>/src/**/?(*.)(spec|test).(ts|js)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/src/hooks/__tests__/useSpeechToText.test.ts',
    '<rootDir>/src/hooks/__tests__/useAudioAnalysis.test.ts',
    '<rootDir>/src/__tests__/integration.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
    '!src/hooks/useAudioAnalysis.ts',
    '!src/hooks/useSpeechToText.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 10000
};