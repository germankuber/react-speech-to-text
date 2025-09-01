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
    'node_modules/(?!(pitchy|fft\\.js)/)'
  ],
  testMatch: [
    '<rootDir>/src/utils/**/__tests__/**/*.(ts|js)',
    '<rootDir>/src/types/**/__tests__/**/*.(ts|js)',
    '<rootDir>/src/utils/**/?(*.)(spec|test).(ts|js)',
    '<rootDir>/src/types/**/?(*.)(spec|test).(ts|js)'
  ],
  collectCoverageFrom: [
    'src/utils/**/*.{ts,tsx}',
    'src/types/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 10000
};