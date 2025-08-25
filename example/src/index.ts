// Componentes de ejemplo para probar la librería Speech to Text
export { default as BasicExample } from './BasicExample';
export { default as AdvancedExample } from './AdvancedExample';
export { default as AudioAnalysisExample } from './AudioAnalysisExample';
export { default as DemoApp } from './DemoApp';

// Re-exportar hooks para facilidad de uso en los ejemplos
export { useSpeechToText, useAudioAnalysis } from 'react-speech-to-text-gk';

// Re-exportar tipos
export type { 
    SpeechToTextConfig, 
    AudioMetrics, 
    PerformanceMode 
} from 'react-speech-to-text-gk';
