import React, { useEffect, useRef, useState } from 'react';
import { useSpeechToText } from '../../src/hooks/useSpeechToText';
import { PerformanceMode } from '../../src/types/speechToText';
import './App.css';

const App: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isListening,
    audioMetrics,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
    transcript,
    interimTranscript
  } = useSpeechToText({
    language: 'es-ES',
    speechVolumeThreshold: 3, // Umbral muy bajo
    speechPauseThreshold: 200, 
    performanceMode: PerformanceMode.SPEED,
    onVoiceStart: (data) => {
      console.log('🎤 CALLBACK VOLUMEN: Empezaste a hablar', data);
      console.log('Volumen que activó:', data.triggerVolume);
    },
    onVoiceStop: (data) => {
      console.log('🔇 CALLBACK VOLUMEN: Dejaste de hablar', data);
      console.log('Duración de pausa:', data.pauseDuration);
    },
    onSpeechCompleted: (data) => {
      console.log('✅ CALLBACK: Reconocimiento de voz completado', data);
      console.log('Tiempo:', new Date().toLocaleTimeString());
    },
    onError: (error) => {
      console.error('❌ Error:', error);
    }
  });

  // Sistema similar a speechCompleted pero para detectar habla basado en transcript
  useEffect(() => {
    if (transcript || interimTranscript) {
      // Si no estaba hablando, marca como hablando
      if (!isSpeaking) {
        console.log('🎤 TRANSCRIPT: Empezaste a hablar');
        console.log('Transcript:', transcript);
        console.log('Interim:', interimTranscript);
        console.log('Tiempo:', new Date().toLocaleTimeString());
        setIsSpeaking(true);
      }
      
      // Limpiar timeout anterior
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      
      // Establecer nuevo timeout para detectar fin de habla
      speakingTimeoutRef.current = setTimeout(() => {
        console.log('🔇 TRANSCRIPT: Dejaste de hablar (silencio detectado)');
        console.log('Tiempo:', new Date().toLocaleTimeString());
        setIsSpeaking(false);
      }, 500); // 500ms sin nuevo transcript = dejó de hablar
    }
  }, [transcript, interimTranscript, isSpeaking]);

  const handleToggle = async () => {
    toggleListening()
    // try {
    //   if (isListening) {
    //     console.log('🛑 Deteniendo...');
    //     await stopListening();
    //     setIsSpeaking(false);
    //     if (speakingTimeoutRef.current) {
    //       clearTimeout(speakingTimeoutRef.current);
    //     }
    //   } else {
    //     console.log('▶️ Iniciando...');
    //     await startListening();
    //   }
    // } catch (error) {
    //   console.error('Error al cambiar estado:', error);
    // }
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

          <div className="metric-item">
            <span className="metric-label">Umbral configurado:</span>
            <span className="metric-value">3%</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Volumen {'>'}  Umbral:</span>
            <span className="metric-value" style={{ color: audioMetrics.currentVolume > 3 ? '#4CAF50' : '#f44336' }}>
              {audioMetrics.currentVolume > 3 ? 'SÍ' : 'NO'}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Hay Transcript:</span>
            <span className="metric-value" style={{ color: (transcript || interimTranscript) ? '#4CAF50' : '#f44336' }}>
              {(transcript || interimTranscript) ? 'SÍ' : 'NO'}
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
          <h3>📋 Cómo funciona:</h3>
          <ul>
            <li><strong>Sistema de detección por TRANSCRIPT:</strong> Detecta habla cuando hay texto reconocido</li>
            <li><strong>Sistema de detección por VOLUMEN:</strong> Detecta habla cuando el volumen supera 3%</li>
            <li>Abre la <strong>Consola del navegador (F12)</strong> para ver todos los logs</li>
            <li>El indicador "HABLANDO" se basa en el sistema de transcript</li>
            <li>Si no funciona el volumen, el transcript siempre funciona</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;