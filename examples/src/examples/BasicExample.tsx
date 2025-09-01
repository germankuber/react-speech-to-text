import React from 'react'
import { useSpeechToText } from 'react-speech-to-text-gk'

const BasicExample: React.FC = () => {
  const { 
    isListening, 
    transcript, 
    isSupported, 
    toggleListening 
  } = useSpeechToText({
    language: 'es-ES'
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
      <h2>🎤 Ejemplo Básico</h2>
      <p>Reconocimiento de voz simple con configuración mínima.</p>
      
      <div className="controls">
        <button onClick={toggleListening}>
          {isListening ? '🛑 Detener' : '🎤 Iniciar'} Escucha
        </button>
      </div>

      <div className="status">
        <div className={`status-dot ${isListening ? 'listening' : ''}`}></div>
        <span>{isListening ? 'Escuchando...' : 'Inactivo'}</span>
      </div>

      <div className="transcript-area">
        <h4>Transcripción:</h4>
        <p>{transcript || 'Haz clic en "Iniciar Escucha" y comienza a hablar...'}</p>
      </div>

      <div className="card">
        <h4>Código de ejemplo:</h4>
        <pre style={{ fontSize: '0.9em', overflow: 'auto' }}>
{`import { useSpeechToText } from 'react-speech-to-text-gk'

function App() {
  const { isListening, transcript, toggleListening } = useSpeechToText({
    language: 'es-ES'
  })

  return (
    <div>
      <button onClick={toggleListening}>
        {isListening ? 'Detener' : 'Iniciar'} Escucha
      </button>
      <p>{transcript}</p>
    </div>
  )
}`}
        </pre>
      </div>
    </div>
  )
}

export default BasicExample