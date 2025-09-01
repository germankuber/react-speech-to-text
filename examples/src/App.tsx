import React, { useState } from 'react';
import VolumeVisualizer from './components/VolumeVisualizer';
import CompleteDashboard from './components/CompleteDashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'volume' | 'complete'>('complete');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex space-x-4">
          <button
            onClick={() => setCurrentView('complete')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'complete'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📊 Complete Dashboard
          </button>
          <button
            onClick={() => setCurrentView('volume')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'volume'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🎤 Volume Visualizer
          </button>
        </div>
      </nav>

      {/* Content */}
      {currentView === 'complete' ? <CompleteDashboard /> : <VolumeVisualizer />}
    </div>
  );
};

export default App;