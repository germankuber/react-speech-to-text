import React from 'react';
import ReactDOM from 'react-dom/client';
import SpeechDetectionDemo from './SpeechDetectionDemo';

console.log('index.tsx: Iniciando aplicación Speech Detection Demo');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('index.tsx: Root creado, renderizando SpeechDetectionDemo...');

root.render(
  <React.StrictMode>
    <SpeechDetectionDemo />
  </React.StrictMode>
);
