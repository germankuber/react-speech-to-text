import React, { useEffect, useState } from 'react';
import { useSpeechToText } from '../../src/hooks/useSpeechToText';
import { PerformanceMode } from '../../src/types/speechToText';
import './App.css';

const App: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const {
    isListening,
    audioMetrics,
    startListening,
    stopListening,
    isSupported,
    transcript,
    interimTranscript
  } = useSpeechToText({
    language: 'es-ES',
    speechVolumeThreshold: 10, // Umbral más bajo para detectar habla
    speechPauseThreshold: 150, // Pausa más corta para detectar fin de habla
    performanceMode: PerformanceMode.SPEED,
    onVoiceStart: (data) => {
      console.log('🎤 Empezaste a hablar', data);
      setIsSpeaking(true);
    },
    onVoiceStop: (data) => {
      console.log('🔇 Dejaste de hablar', data);
      setIsSpeaking(false);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });

  // Detectar habla basado en el volumen directamente como backup
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        if (audioMetrics.currentVolume > 10) {
          if (!isSpeaking) {
            setIsSpeaking(true);
          }
        } else {
          if (isSpeaking) {
            // Pequeño delay antes de marcar como no hablando
            setTimeout(() => {
              if (audioMetrics.currentVolume <= 10) {
                setIsSpeaking(false);
              }
            }, 200);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isListening, audioMetrics.currentVolume, isSpeaking]);

  const handleToggle = async () => {
    try {
      if (isListening) {
        await stopListening();
        setIsSpeaking(false);
      } else {
        await startListening();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="app">
        <div className="error-message">
          <h2>❌ Tu navegador no soporta reconocimiento de voz</h2>
          <p>Prueba con Chrome, Edge o Safari</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <h1>🎤 Detector de Voz Simple</h1>
        <p className="subtitle">
          Presiona el botón para empezar a detectar si hablas o no
        </p>

        <div className="controls">
          <button 
            onClick={handleToggle}
            className={`toggle-button ${isListening ? 'listening' : ''}`}
          >
            {isListening ? '🔴 Detener' : '🎤 Iniciar'}
          </button>
        </div>

        <div className="status-section">
          <div className={`status-indicator ${isSpeaking ? 'speaking' : 'silent'}`}>
            <div className="status-icon">
              {isSpeaking ? '🗣️' : '🤐'}
            </div>
            <div className="status-text">
              {isSpeaking ? 'HABLANDO' : 'SILENCIO'}
            </div>
          </div>
        </div>

        {(transcript || interimTranscript) && (
          <div className="transcript-section">
            <h3>🎯 Texto reconocido:</h3>
            <div className="transcript-box">
              <span className="final-transcript">{transcript}</span>
              <span className="interim-transcript">{interimTranscript}</span>
            </div>
          </div>
        )}

        <div className="metrics">
          <div className="metric-item">
            <span className="metric-label">Estado:</span>
            <span className="metric-value">
              {!isListening ? 'Desactivado' : isSpeaking ? 'Hablando' : 'Escuchando'}
            </span>
          </div>
          
          <div className="metric-item">
            <span className="metric-label">Volumen:</span>
            <span className="metric-value">
              {audioMetrics.currentVolume.toFixed(1)}%
            </span>
          </div>

          {audioMetrics.currentPitch > 0 && (
            <div className="metric-item">
              <span className="metric-label">Tono:</span>
              <span className="metric-value">
                {audioMetrics.currentPitch.toFixed(1)} Hz
              </span>
            </div>
          )}
        </div>

        <div className="volume-bar-container">
          <div className="volume-label">Nivel de Volumen</div>
          <div className="volume-bar">
            <div 
              className="volume-fill"
              style={{ 
                width: `${Math.min(audioMetrics.currentVolume, 100)}%`,
                backgroundColor: isSpeaking ? '#4CAF50' : '#2196F3'
              }}
            ></div>
          </div>
          <div className="volume-percentage">
            {audioMetrics.currentVolume.toFixed(0)}%
          </div>
        </div>

        <div className="instructions">
          <h3>📋 Instrucciones:</h3>
          <ul>
            <li>Haz clic en "Iniciar" para empezar (permite el micrófono cuando te lo pida)</li>
            <li>Habla normalmente y verás el indicador cambiar a "HABLANDO"</li>
            <li>El texto que digas aparecerá en la caja de texto</li>
            <li>Cuando dejes de hablar, volverá a "SILENCIO"</li>
            <li>El volumen se muestra en tiempo real</li>
            <li>Haz clic en "Detener" para parar completamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
