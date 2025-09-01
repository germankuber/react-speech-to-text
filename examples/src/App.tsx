import React, { useState } from 'react'
import BasicExample from './examples/BasicExample'
import AudioMetricsExample from './examples/AudioMetricsExample'
import TranscriptionExample from './examples/TranscriptionExample'
import VoiceControlsExample from './examples/VoiceControlsExample'
import AudioAnalysisExample from './examples/AudioAnalysisExample'

type ExampleType = 'basic' | 'metrics' | 'transcription' | 'voice-controls' | 'audio-analysis'

const examples = [
  { id: 'basic' as ExampleType, name: 'Ejemplo Básico', description: 'Reconocimiento de voz simple' },
  { id: 'metrics' as ExampleType, name: 'Métricas de Audio', description: 'Con análisis en tiempo real' },
  { id: 'transcription' as ExampleType, name: 'Transcripción', description: 'Herramienta de transcripción completa' },
  { id: 'voice-controls' as ExampleType, name: 'Controles por Voz', description: 'Comandos de voz interactivos' },
  { id: 'audio-analysis' as ExampleType, name: 'Análisis de Audio', description: 'Solo análisis de audio sin reconocimiento' }
]

function App() {
  const [activeExample, setActiveExample] = useState<ExampleType>('basic')

  const renderExample = () => {
    switch (activeExample) {
      case 'basic':
        return <BasicExample />
      case 'metrics':
        return <AudioMetricsExample />
      case 'transcription':
        return <TranscriptionExample />
      case 'voice-controls':
        return <VoiceControlsExample />
      case 'audio-analysis':
        return <AudioAnalysisExample />
      default:
        return <BasicExample />
    }
  }

  return (
    <div>
      <nav className="example-nav">
        <ul>
          {examples.map(example => (
            <li key={example.id}>
              <button
                className={activeExample === example.id ? 'active' : ''}
                onClick={() => setActiveExample(example.id)}
              >
                {example.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        <div className="card">
          <h1>React Speech-to-Text Examples</h1>
          <p>
            <strong>{examples.find(e => e.id === activeExample)?.name}</strong>: {' '}
            {examples.find(e => e.id === activeExample)?.description}
          </p>
          
          <div>
            {renderExample()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App