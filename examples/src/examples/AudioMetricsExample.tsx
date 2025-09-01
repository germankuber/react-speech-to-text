import React from 'react'
import { useSpeechToText, PerformanceMode } from 'react-speech-to-text-gk'

const AudioMetricsExample: React.FC = () => {
  const {
    isListening,
    transcript,
    interimTranscript,
    audioMetrics,
    isSupported,
    toggleListening,
    clearTranscript
  } = useSpeechToText({
    language: 'es-ES',
    performanceMode: PerformanceMode.BALANCED,
    silenceTimeout: 1000
  })

  if (!isSupported) {
    return (
      <div className="card">
        <h2>⚠️ No Soportado</h2>
        <p>Tu navegador no soporta el reconocimiento de voz. Usa Chrome, Safari o Edge.</p>
      </div>
    )
  }

  return (
    <div>
      <h2>📊 Métricas de Audio en Tiempo Real</h2>
      <p>Reconocimiento de voz con análisis completo de audio.</p>
      
      <div className="controls">
        <button onClick={toggleListening}>
          {isListening ? '🛑 Detener' : '🎤 Iniciar'} Escucha
        </button>
        <button onClick={clearTranscript} disabled={!transcript}>
          🗑️ Limpiar
        </button>
      </div>

      <div className="status">
        <div className={`status-dot ${isListening ? 'listening' : ''}`}></div>
        <span>{isListening ? 'Escuchando y analizando...' : 'Inactivo'}</span>
      </div>

      {isListening && (
        <div className="metrics-grid">
          <div className="metric">
            <h4>Volumen</h4>
            <div className="volume-bar">
              <div 
                className="volume-fill" 
                style={{ width: `${audioMetrics.currentVolume}%` }}
              ></div>
            </div>
            <div className="metric-value">{audioMetrics.currentVolume.toFixed(1)}%</div>
          </div>

          <div className="metric">
            <h4>Tono (Pitch)</h4>
            <div className="metric-value">
              {audioMetrics.currentPitch ? `${audioMetrics.currentPitch.toFixed(1)} Hz` : 'N/A'}
            </div>
          </div>

          <div className="metric">
            <h4>Centroide Espectral</h4>
            <div className="metric-value">
              {audioMetrics.currentSpectralCentroid ? `${audioMetrics.currentSpectralCentroid.toFixed(0)} Hz` : 'N/A'}
            </div>
          </div>

          <div className="metric">
            <h4>Puntos de Datos</h4>
            <div className="metric-value">{audioMetrics.volumeData.length}</div>
          </div>
        </div>
      )}

      <div className="transcript-area">
        <h4>Transcripción:</h4>
        <p>
          <span>{transcript}</span>
          {interimTranscript && (
            <span className="interim"> {interimTranscript}</span>
          )}
          {!transcript && !interimTranscript && (
            <span>Haz clic en "Iniciar Escucha" y comienza a hablar...</span>
          )}
        </p>
      </div>

      <div className="card">
        <h4>Configuración del ejemplo:</h4>
        <ul>
          <li><strong>Idioma:</strong> Español (es-ES)</li>
          <li><strong>Modo de rendimiento:</strong> Balanceado</li>
          <li><strong>Timeout de silencio:</strong> 1000ms</li>
          <li><strong>Análisis en tiempo real:</strong> Activado</li>
        </ul>
      </div>
    </div>
  )
}

export default AudioMetricsExample