# React Speech-to-Text Example

This is a demo application showing how to use `react-speech-to-text-gk` library.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the demo.

## Features Demonstrated

- Real-time speech recognition
- Audio metrics (volume, pitch, spectral centroid)
- Performance mode configuration
- Session metadata and analytics
- Interactive charts
- JSON export functionality

## Development Note

This example uses direct imports from the source code for development purposes. When using the published package in your project:

```bash
npm install react-speech-to-text-gk
```

Import and use:
```tsx
import { useSpeechToText, PerformanceMode } from 'react-speech-to-text-gk';

function MyComponent() {
  const { isListening, transcript, toggleListening } = useSpeechToText({
    language: 'en-US',
    performanceMode: PerformanceMode.BALANCED
  });

  return (
    <div>
      <button onClick={toggleListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      <p>{transcript}</p>
    </div>
  );
}
```