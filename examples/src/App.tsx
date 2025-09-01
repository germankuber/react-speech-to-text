import React from 'react';
import VolumeVisualizer from './components/VolumeVisualizer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <VolumeVisualizer />
    </div>
  );
};

export default App;