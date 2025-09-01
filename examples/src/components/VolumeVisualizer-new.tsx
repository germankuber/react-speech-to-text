import React from 'react';
import { useSpeechToText } from '../../../src/hooks/useSpeechToText';
import { PerformanceMode } from '../../../src/types/speechToText';

const VolumeVisualizer: React.FC = () => {
  const {
    isListening,
    audioMetrics,
    toggleListening,
    isSupported,
  } = useSpeechToText({
    language: 'es-ES',
    speechVolumeThreshold: 3,
    speechPauseThreshold: 200,
    performanceMode: PerformanceMode.SPEED,
  });

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-red-600 text-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">❌ Error</h2>
          <p className="text-lg">Tu navegador no soporta reconocimiento de voz</p>
          <p className="text-sm mt-2 opacity-75">Prueba con Chrome, Edge o Safari</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        {/* Título */}
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          🎤 Visualizador de Volumen
        </h1>

        {/* Botón de control */}
        <div className="flex justify-center mb-8">
          <button
            onClick={toggleListening}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isListening ? '🔴 Detener' : '🎤 Iniciar'}
          </button>
        </div>

        {/* Visualizador de volumen circular */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            {/* Círculo de fondo */}
            <div className="absolute inset-0 rounded-full border-8 border-gray-600/30"></div>
            
            {/* Círculo de progreso */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 192 192">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className={`transition-all duration-300 ${
                  audioMetrics.currentVolume > 20 ? 'text-red-400' :
                  audioMetrics.currentVolume > 10 ? 'text-yellow-400' :
                  'text-green-400'
                }`}
                strokeDasharray={`${(audioMetrics.currentVolume / 100) * 553} 553`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Contenido central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="text-4xl font-bold mb-2">
                {Math.round(audioMetrics.currentVolume)}%
              </div>
              <div className="text-sm opacity-75">
                {isListening ? 'Escuchando...' : 'Detenido'}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de volumen horizontal */}
        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Nivel de Audio</span>
            <span>{Math.round(audioMetrics.currentVolume)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${
                audioMetrics.currentVolume > 20 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                audioMetrics.currentVolume > 10 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                'bg-gradient-to-r from-green-400 to-green-600'
              }`}
              style={{ width: `${Math.min(audioMetrics.currentVolume, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-2 gap-4 text-white">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xs opacity-75 mb-1">Tono</div>
            <div className="font-semibold">
              {audioMetrics.currentPitch > 0 ? `${Math.round(audioMetrics.currentPitch)} Hz` : '--'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xs opacity-75 mb-1">Estado</div>
            <div className={`font-semibold ${isListening ? 'text-green-400' : 'text-gray-400'}`}>
              {isListening ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>

        {/* Indicador de umbral */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            audioMetrics.currentVolume > 3 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              audioMetrics.currentVolume > 3 ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
            Umbral: 3% {audioMetrics.currentVolume > 3 ? '✓' : '○'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeVisualizer;
