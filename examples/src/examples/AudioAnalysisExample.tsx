import React, { useEffect, useState } from 'react'
import { useAudioAnalysis, PerformanceMode } from 'react-speech-to-text-gk'

const AudioAnalysisExample: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audioData, setAudioData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const {
    initializeAudioAnalysis,
    stopAudioAnalysis,
    getAudioData,
    clearAudioData
  } = useAudioAnalysis(PerformanceMode.QUALITY)

  // Actualizar datos de audio en tiempo real
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isAnalyzing) {
      intervalId = setInterval(() => {
        const data = getAudioData()
        setAudioData(data)
      }, 50) // Actualizar cada 50ms para suavidad visual
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isAnalyzing, getAudioData])

  const handleStartAnalysis = async () => {
    try {
      setError(null)
      await initializeAudioAnalysis({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      setIsAnalyzing(true)
    } catch (err) {
      setError('Error al acceder al micrófono. Verifica los permisos.')
      console.error('Audio analysis error:', err)
    }
  }

  const handleStopAnalysis = () => {
    stopAudioAnalysis()
    setIsAnalyzing(false)
    setAudioData(null)
  }

  const handleClearData = () => {
    clearAudioData()
    setAudioData(null)
  }

  // Función para obtener el color basado en el volumen
  const getVolumeColor = (volume: number) => {
    if (volume < 30) return '#4ade80' // Verde
    if (volume < 60) return '#fbbf24' // Amarillo
    if (volume < 80) return '#fb923c' // Naranja
    return '#ef4444' // Rojo
  }

  // Función para clasificar el tono
  const getPitchCategory = (pitch: number | null) => {
    if (!pitch) return 'No detectado'
    if (pitch < 150) return 'Grave'
    if (pitch < 250) return 'Medio-Grave'
    if (pitch < 350) return 'Medio'
    if (pitch < 450) return 'Medio-Agudo'
    return 'Agudo'
  }

  return (
    <div>
      <h2>🔊 Análisis de Audio Puro</h2>
      <p>Análisis de audio en tiempo real sin reconocimiento de voz.</p>
      
      <div className="controls">
        <button 
          onClick={isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
          style={{
            backgroundColor: isAnalyzing ? '#ef4444' : '#10b981',
            color: 'white'
          }}
        >
          {isAnalyzing ? '🛑 Detener Análisis' : '🔊 Iniciar Análisis'}
        </button>
        {audioData && (
          <button onClick={handleClearData}>
            🗑️ Limpiar Datos
          </button>
        )}
      </div>

      <div className="status">
        <div className={`status-dot ${isAnalyzing ? 'listening' : ''}`}></div>
        <span>
          {isAnalyzing 
            ? 'Analizando audio en tiempo real...' 
            : error || 'Listo para análisis'
          }
        </span>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          margin: '15px 0',
          backgroundColor: '#fecaca',
          color: '#b91c1c',
          borderRadius: '8px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {isAnalyzing && audioData && (
        <>
          {/* Métricas principales */}
          <div className="metrics-grid">
            <div className="metric">
              <h4>Volumen Actual</h4>
              <div className="volume-bar">
                <div 
                  className="volume-fill" 
                  style={{ 
                    width: `${audioData.currentVolume}%`,
                    backgroundColor: getVolumeColor(audioData.currentVolume)
                  }}
                ></div>
              </div>
              <div className="metric-value" style={{ color: getVolumeColor(audioData.currentVolume) }}>
                {audioData.currentVolume.toFixed(1)}%
              </div>
            </div>

            <div className="metric">
              <h4>Frecuencia Fundamental</h4>
              <div className="metric-value">
                {audioData.currentPitch ? `${audioData.currentPitch.toFixed(1)} Hz` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                {getPitchCategory(audioData.currentPitch)}
              </div>
            </div>

            <div className="metric">
              <h4>Centroide Espectral</h4>
              <div className="metric-value">
                {audioData.currentSpectralCentroid ? `${audioData.currentSpectralCentroid.toFixed(0)} Hz` : 'N/A'}
              </div>
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                Brillo del sonido
              </div>
            </div>

            <div className="metric">
              <h4>Muestras de Audio</h4>
              <div className="metric-value">
                {audioData.volumeData?.length || 0}
              </div>
              <div style={{ fontSize: '0.8em', color: '#888' }}>
                Puntos de datos
              </div>
            </div>
          </div>

          {/* Visualización avanzada */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginTop: '20px'
          }}>
            {/* Histograma de volumen */}
            <div className="card">
              <h4>📊 Distribución de Volumen</h4>
              <div style={{ display: 'flex', alignItems: 'end', height: '100px', gap: '2px' }}>
                {audioData.volumeData?.slice(-20).map((volume: number, index: number) => (
                  <div
                    key={index}
                    style={{
                      width: '100%',
                      height: `${volume}%`,
                      backgroundColor: getVolumeColor(volume),
                      borderRadius: '2px 2px 0 0',
                      opacity: 0.5 + (index / 20) * 0.5
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                Últimas 20 muestras
              </div>
            </div>

            {/* Análisis de tono */}
            <div className="card">
              <h4>🎵 Análisis de Tono</h4>
              {audioData.pitchData?.length > 0 ? (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Rango detectado:</strong><br/>
                    {Math.min(...audioData.pitchData.filter((p: number) => p > 0)).toFixed(1)} - {' '}
                    {Math.max(...audioData.pitchData.filter((p: number) => p > 0)).toFixed(1)} Hz
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end', height: '60px', gap: '1px' }}>
                    {audioData.pitchData?.slice(-30).map((pitch: number, index: number) => (
                      <div
                        key={index}
                        style={{
                          width: '100%',
                          height: pitch > 0 ? `${Math.min((pitch / 400) * 100, 100)}%` : '2%',
                          backgroundColor: pitch > 0 ? '#3b82f6' : '#6b7280',
                          borderRadius: '1px 1px 0 0',
                          opacity: 0.4 + (index / 30) * 0.6
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
                    Evolución temporal del tono
                  </div>
                </>
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic' }}>
                  No se han detectado tonos aún...
                </p>
              )}
            </div>
          </div>

          {/* Estadísticas detalladas */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h4>📈 Estadísticas de Sesión</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px'
            }}>
              <div>
                <strong>Volumen:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Actual: {audioData.currentVolume.toFixed(1)}%</li>
                  <li>Máximo: {audioData.volumeData?.length > 0 ? Math.max(...audioData.volumeData).toFixed(1) : '0'}%</li>
                  <li>Promedio: {audioData.volumeData?.length > 0 ? (audioData.volumeData.reduce((a: number, b: number) => a + b, 0) / audioData.volumeData.length).toFixed(1) : '0'}%</li>
                </ul>
              </div>
              <div>
                <strong>Frecuencia:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Actual: {audioData.currentPitch ? `${audioData.currentPitch.toFixed(1)} Hz` : 'N/A'}</li>
                  <li>Estabilidad: {audioData.pitchData?.filter((p: number) => p > 0).length > 5 ? 'Estable' : 'Variable'}</li>
                </ul>
              </div>
              <div>
                <strong>Calidad:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  <li>Centroide: {audioData.currentSpectralCentroid?.toFixed(0) || 'N/A'} Hz</li>
                  <li>Claridad: {audioData.currentSpectralCentroid > 2000 ? 'Alta' : audioData.currentSpectralCentroid > 1000 ? 'Media' : 'Baja'}</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Información técnica */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h4>⚙️ Configuración Técnica</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '15px'
        }}>
          <div>
            <strong>🎯 Modo de Rendimiento:</strong>
            <p>QUALITY - Máxima precisión y detalle</p>
            <ul>
              <li>FFT Size: 4096</li>
              <li>Update Rate: 30 FPS</li>
              <li>Rango de pitch: 60-800 Hz</li>
            </ul>
          </div>
          <div>
            <strong>🔧 Configuración de Audio:</strong>
            <ul>
              <li>Echo Cancellation: Activado</li>
              <li>Noise Suppression: Activado</li>
              <li>Sample Rate: 44.1 kHz</li>
            </ul>
          </div>
          <div>
            <strong>📊 Métricas Calculadas:</strong>
            <ul>
              <li>Volumen RMS en tiempo real</li>
              <li>Detección de pitch con autocorrelación</li>
              <li>Centroide espectral para brillo</li>
              <li>Análisis de estabilidad tonal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioAnalysisExample