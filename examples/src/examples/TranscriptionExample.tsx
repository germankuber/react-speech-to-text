import React from 'react'
import { useSpeechToText, PerformanceMode } from 'react-speech-to-text-gk'

const TranscriptionExample: React.FC = () => {
  const {
    isListening,
    transcript,
    interimTranscript,
    sessionMetadata,
    audioMetrics,
    isSupported,
    toggleListening,
    clearTranscript,
    copyMetadataToClipboard
  } = useSpeechToText({
    language: 'es-ES',
    performanceMode: PerformanceMode.QUALITY,
    silenceTimeout: 2000,
    optimizedMode: false
  })

  const handleExport = async () => {
    const result = await copyMetadataToClipboard()
    alert(result.message)
  }

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
      <h2>📝 Herramienta de Transcripción</h2>
      <p>Transcripción de alta calidad con métricas de sesión completas.</p>
      
      <div className="controls">
        <button onClick={toggleListening}>
          {isListening ? '🛑 Detener Grabación' : '🎤 Iniciar Grabación'}
        </button>
        <button onClick={clearTranscript} disabled={!transcript}>
          🗑️ Limpiar Todo
        </button>
        {sessionMetadata && (
          <button onClick={handleExport}>
            📋 Exportar Datos
          </button>
        )}
      </div>

      <div className="status">
        <div className={`status-dot ${isListening ? 'listening' : ''}`}></div>
        <span>
          {isListening 
            ? 'Grabando en alta calidad...' 
            : transcript ? 'Grabación completada' : 'Listo para grabar'
          }
        </span>
      </div>

      <div className="transcript-area" style={{ minHeight: '150px' }}>
        <h4>Transcripción:</h4>
        <p style={{ lineHeight: '1.6' }}>
          <span>{transcript}</span>
          {interimTranscript && (
            <span className="interim"> {interimTranscript}</span>
          )}
          {!transcript && !interimTranscript && (
            <span>Haz clic en "Iniciar Grabación" y comienza a hablar...</span>
          )}
        </p>
      </div>

      {sessionMetadata && (
        <div className="metrics-grid">
          <div className="metric">
            <h4>Duración Total</h4>
            <div className="metric-value">
              {(sessionMetadata.totalDuration / 1000).toFixed(1)}s
            </div>
          </div>

          <div className="metric">
            <h4>Palabras</h4>
            <div className="metric-value">
              {sessionMetadata.words.length}
            </div>
          </div>

          <div className="metric">
            <h4>Palabras por Minuto</h4>
            <div className="metric-value">
              {sessionMetadata.totalDuration > 0 
                ? Math.round((sessionMetadata.words.length / sessionMetadata.totalDuration) * 60000)
                : 0
              }
            </div>
          </div>

          <div className="metric">
            <h4>Volumen Promedio</h4>
            <div className="metric-value">
              {sessionMetadata.overallAverageVolume.toFixed(1)} dB
            </div>
          </div>

          <div className="metric">
            <h4>Tono Promedio</h4>
            <div className="metric-value">
              {sessionMetadata.overallAveragePitch ? `${sessionMetadata.overallAveragePitch.toFixed(1)} Hz` : 'N/A'}
            </div>
          </div>

          <div className="metric">
            <h4>Volumen Máximo</h4>
            <div className="metric-value">
              {sessionMetadata.overallPeakVolume.toFixed(1)} dB
            </div>
          </div>
        </div>
      )}

      {isListening && (
        <div className="card">
          <h4>Métricas en Tiempo Real:</h4>
          <p>Volumen actual: <strong>{audioMetrics.currentVolume.toFixed(1)}%</strong></p>
          <p>Tono actual: <strong>{audioMetrics.currentPitch ? `${audioMetrics.currentPitch.toFixed(1)} Hz` : 'N/A'}</strong></p>
        </div>
      )}

      <div className="card">
        <h4>Configuración de calidad máxima:</h4>
        <ul>
          <li><strong>Modo de rendimiento:</strong> Calidad (máxima precisión)</li>
          <li><strong>Modo optimizado:</strong> Desactivado (más alternativas)</li>
          <li><strong>Timeout de silencio:</strong> 2000ms</li>
          <li><strong>Análisis completo:</strong> Activado</li>
        </ul>
      </div>
    </div>
  )
}

export default TranscriptionExample