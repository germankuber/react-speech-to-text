import React, { useEffect, useState } from 'react'
import { useSpeechToText, PerformanceMode } from 'react-speech-to-text-gk'

interface AppState {
  backgroundColor: string
  textColor: string
  fontSize: number
  message: string
  counter: number
}

const VoiceControlsExample: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    backgroundColor: '#242424',
    textColor: '#ffffff',
    fontSize: 16,
    message: '¡Hola! Usa comandos de voz para controlar esta interfaz.',
    counter: 0
  })

  const [lastCommand, setLastCommand] = useState<string>('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])

  const {
    isListening,
    transcript,
    isSupported,
    toggleListening,
    clearTranscript
  } = useSpeechToText({
    language: 'es-ES',
    performanceMode: PerformanceMode.SPEED,
    silenceTimeout: 1500
  })

  // Procesar comandos de voz
  useEffect(() => {
    if (!transcript) return

    const command = transcript.toLowerCase()
    let commandExecuted = false

    // Comandos de color de fondo
    if (command.includes('fondo rojo') || command.includes('color rojo')) {
      setAppState(prev => ({ ...prev, backgroundColor: '#cc0000' }))
      setLastCommand('🎨 Fondo cambiado a rojo')
      commandExecuted = true
    } else if (command.includes('fondo azul') || command.includes('color azul')) {
      setAppState(prev => ({ ...prev, backgroundColor: '#0066cc' }))
      setLastCommand('🎨 Fondo cambiado a azul')
      commandExecuted = true
    } else if (command.includes('fondo verde') || command.includes('color verde')) {
      setAppState(prev => ({ ...prev, backgroundColor: '#00aa00' }))
      setLastCommand('🎨 Fondo cambiado a verde')
      commandExecuted = true
    } else if (command.includes('fondo negro') || command.includes('fondo oscuro')) {
      setAppState(prev => ({ ...prev, backgroundColor: '#242424' }))
      setLastCommand('🎨 Fondo cambiado a negro')
      commandExecuted = true
    }

    // Comandos de tamaño de texto
    else if (command.includes('texto grande') || command.includes('aumentar texto')) {
      setAppState(prev => ({ ...prev, fontSize: Math.min(prev.fontSize + 4, 32) }))
      setLastCommand('📝 Texto aumentado')
      commandExecuted = true
    } else if (command.includes('texto pequeño') || command.includes('disminuir texto')) {
      setAppState(prev => ({ ...prev, fontSize: Math.max(prev.fontSize - 4, 12) }))
      setLastCommand('📝 Texto disminuido')
      commandExecuted = true
    } else if (command.includes('texto normal')) {
      setAppState(prev => ({ ...prev, fontSize: 16 }))
      setLastCommand('📝 Tamaño de texto restaurado')
      commandExecuted = true
    }

    // Comandos de contador
    else if (command.includes('incrementar') || command.includes('sumar')) {
      setAppState(prev => ({ ...prev, counter: prev.counter + 1 }))
      setLastCommand('➕ Contador incrementado')
      commandExecuted = true
    } else if (command.includes('decrementar') || command.includes('restar')) {
      setAppState(prev => ({ ...prev, counter: prev.counter - 1 }))
      setLastCommand('➖ Contador decrementado')
      commandExecuted = true
    } else if (command.includes('reiniciar contador')) {
      setAppState(prev => ({ ...prev, counter: 0 }))
      setLastCommand('🔄 Contador reiniciado')
      commandExecuted = true
    }

    // Comandos de mensaje
    else if (command.includes('mensaje') && (command.includes('hola') || command.includes('saludo'))) {
      setAppState(prev => ({ ...prev, message: '¡Hola! 👋 Comando ejecutado por voz' }))
      setLastCommand('💬 Mensaje de saludo establecido')
      commandExecuted = true
    } else if (command.includes('mensaje') && command.includes('bienvenida')) {
      setAppState(prev => ({ ...prev, message: '¡Bienvenido a la demo de comandos por voz! 🎉' }))
      setLastCommand('💬 Mensaje de bienvenida establecido')
      commandExecuted = true
    } else if (command.includes('limpiar mensaje')) {
      setAppState(prev => ({ ...prev, message: '' }))
      setLastCommand('🗑️ Mensaje limpiado')
      commandExecuted = true
    }

    // Comandos de navegación/control
    else if (command.includes('resetear todo') || command.includes('reiniciar todo')) {
      setAppState({
        backgroundColor: '#242424',
        textColor: '#ffffff',
        fontSize: 16,
        message: '¡Todo ha sido reiniciado por comando de voz! 🔄',
        counter: 0
      })
      setLastCommand('🔄 Interfaz completamente reiniciada')
      commandExecuted = true
    }

    if (commandExecuted) {
      setCommandHistory(prev => [transcript, ...prev.slice(0, 4)])
      setTimeout(() => clearTranscript(), 1000)
    }
  }, [transcript, clearTranscript])

  if (!isSupported) {
    return (
      <div className="card">
        <h2>⚠️ No Soportado</h2>
        <p>Tu navegador no soporta el reconocimiento de voz. Usa Chrome, Safari o Edge.</p>
      </div>
    )
  }

  return (
    <div style={{ 
      backgroundColor: appState.backgroundColor, 
      color: appState.textColor,
      fontSize: `${appState.fontSize}px`,
      transition: 'all 0.3s ease',
      padding: '20px',
      borderRadius: '8px',
      minHeight: '400px'
    }}>
      <h2>🗣️ Controles por Voz Interactivos</h2>
      <p>Usa tu voz para controlar esta interfaz en tiempo real.</p>
      
      <div className="controls">
        <button 
          onClick={toggleListening}
          style={{
            backgroundColor: isListening ? '#ff4444' : '#44aa44',
            color: 'white',
            fontSize: '14px'
          }}
        >
          {isListening ? '🛑 Detener' : '🎤 Activar'} Comandos
        </button>
      </div>

      <div className="status" style={{ marginBottom: '20px' }}>
        <div className={`status-dot ${isListening ? 'listening' : ''}`}></div>
        <span>{isListening ? 'Escuchando comandos...' : 'Inactivo'}</span>
      </div>

      {appState.message && (
        <div style={{ 
          padding: '15px', 
          margin: '15px 0',
          border: '2px solid currentColor',
          borderRadius: '8px',
          backgroundColor: 'rgba(255,255,255,0.1)'
        }}>
          <strong>Mensaje:</strong> {appState.message}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '15px',
        margin: '20px 0'
      }}>
        <div style={{ padding: '15px', border: '1px solid currentColor', borderRadius: '8px' }}>
          <h4>📊 Estado Actual</h4>
          <p><strong>Contador:</strong> {appState.counter}</p>
          <p><strong>Tamaño de fuente:</strong> {appState.fontSize}px</p>
          <p><strong>Color de fondo:</strong> {appState.backgroundColor}</p>
        </div>

        <div style={{ padding: '15px', border: '1px solid currentColor', borderRadius: '8px' }}>
          <h4>⚡ Último Comando</h4>
          <p>{lastCommand || 'Ningún comando ejecutado aún'}</p>
          {transcript && (
            <p><strong>Escuchando:</strong> "{transcript}"</p>
          )}
        </div>
      </div>

      {commandHistory.length > 0 && (
        <div style={{ padding: '15px', border: '1px solid currentColor', borderRadius: '8px', marginTop: '15px' }}>
          <h4>📝 Historial de Comandos</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {commandHistory.map((cmd, index) => (
              <li key={index} style={{ 
                padding: '5px 0', 
                opacity: 1 - (index * 0.2),
                borderBottom: index < commandHistory.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
              }}>
                "{cmd}"
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ 
        padding: '15px', 
        border: '1px solid currentColor', 
        borderRadius: '8px',
        marginTop: '20px',
        backgroundColor: 'rgba(255,255,255,0.05)'
      }}>
        <h4>🎯 Comandos Disponibles</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '10px',
          fontSize: '14px'
        }}>
          <div>
            <strong>🎨 Colores:</strong>
            <ul>
              <li>"fondo rojo/azul/verde/negro"</li>
            </ul>
          </div>
          <div>
            <strong>📝 Texto:</strong>
            <ul>
              <li>"texto grande/pequeño/normal"</li>
            </ul>
          </div>
          <div>
            <strong>🔢 Contador:</strong>
            <ul>
              <li>"incrementar/decrementar"</li>
              <li>"reiniciar contador"</li>
            </ul>
          </div>
          <div>
            <strong>💬 Mensajes:</strong>
            <ul>
              <li>"mensaje hola/bienvenida"</li>
              <li>"limpiar mensaje"</li>
            </ul>
          </div>
        </div>
        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
          <strong>🔄 Comando especial:</strong> "resetear todo" - reinicia toda la interfaz
        </p>
      </div>
    </div>
  )
}

export default VoiceControlsExample