import React, { useState } from 'react';
import CompleteDashboard from './components/CompleteDashboard';
import VolumeVisualizer from './components/VolumeVisualizer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'basic' | 'advanced'>('basic');

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Speech to Text Examples</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setCurrentView('basic')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'basic'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Basic Example
                </button>
                <button
                  onClick={() => setCurrentView('advanced')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'advanced'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Advanced Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'basic' ? <VolumeVisualizer /> : <CompleteDashboard />}
      </main>
    </div>
  );
};

export default App;