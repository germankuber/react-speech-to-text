import React from 'react';
import ReactDOM from 'react-dom/client';
import TestApp from './TestApp';

console.log('index.tsx: Iniciando aplicación');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

console.log('index.tsx: Root creado, renderizando...');

root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
