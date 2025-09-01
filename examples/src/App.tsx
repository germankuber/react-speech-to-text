import React from 'react';
import VolumeVisualizer from './components/VolumeVisualizer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <VolumeVisualizer />
    </div>
  );
};

export default App;