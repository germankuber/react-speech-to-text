import '@testing-library/jest-dom';

// Mock React DOM issue with React 19
global.IS_REACT_ACT_ENVIRONMENT = true;

// Fix for React 19 indexOf error
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
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