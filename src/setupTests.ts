import '@testing-library/jest-dom';

// Fix for React DOM indexOf issue
Object.defineProperty(String.prototype, 'indexOf', {
  value: function(searchValue: string, fromIndex?: number) {
    if (this == null) {
      return -1;
    }
    return String.prototype.indexOf.call(this, searchValue, fromIndex);
  },
  writable: true,
  configurable: true
});

// Mock React DOM issue with React 18/19
global.IS_REACT_ACT_ENVIRONMENT = true;

// Fix for React 18 compatibility issues with testing library
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Fix for React indexOf error and location issues
if (typeof window !== 'undefined') {
  // Mock HTMLElement.prototype methods that may be missing
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = jest.fn();
  }
  
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost/',
      origin: 'http://localhost',
      pathname: '/',
      search: '',
      hash: '',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
    writable: true,
  });
}

// Mock Web APIs that are not available in jsdom
const mockSpeechRecognition = jest.fn(() => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  serviceURI: '',
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

const mockWebkitSpeechRecognition = jest.fn(() => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  serviceURI: '',
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock AudioContext
const mockAudioContext = jest.fn(() => ({
  state: 'running',
  sampleRate: 44100,
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn()
  })),
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0.3,
    minDecibels: -90,
    maxDecibels: -10,
    getByteFrequencyData: jest.fn(),
    getByteTimeDomainData: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }))
}));

// Mock getUserMedia
const mockGetUserMedia = jest.fn().mockResolvedValue({
  getTracks: () => [{
    stop: jest.fn(),
    kind: 'audio',
    enabled: true,
    readyState: 'live'
  }],
  getAudioTracks: () => [{
    stop: jest.fn(),
    kind: 'audio',
    enabled: true,
    readyState: 'live'
  }]
});

// Mock clipboard
const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
  readText: jest.fn().mockResolvedValue('')
};

// Setup global mocks
Object.defineProperty(global, 'window', {
  value: {
    ...window,
    SpeechRecognition: mockSpeechRecognition,
    webkitSpeechRecognition: mockWebkitSpeechRecognition,
    AudioContext: mockAudioContext,
    webkitAudioContext: mockAudioContext,
    navigator: {
      ...window.navigator,
      mediaDevices: {
        getUserMedia: mockGetUserMedia
      },
      clipboard: mockClipboard
    }
  },
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: {
    ...navigator,
    mediaDevices: {
      getUserMedia: mockGetUserMedia
    },
    clipboard: mockClipboard
  },
  writable: true
});

// Mock pitchy module to avoid ES module issues
jest.mock('pitchy', () => ({
  PitchDetector: jest.fn().mockImplementation(() => ({
    findPitch: jest.fn().mockReturnValue([440, 0.9])
  }))
}));

// Mock timers for better test control
jest.useFakeTimers();