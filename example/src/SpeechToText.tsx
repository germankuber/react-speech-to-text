import React, { useState } from 'react';
import { PerformanceMode, SpeechToTextConfig, useSpeechToText } from 'react-speech-to-text-gk';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './SpeechToText.css';

const SpeechToText: React.FC = () => {
  const [optimizedMode, setOptimizedMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'speak' | 'json' | 'charts'>('speak');
  const [copySuccess, setCopySuccess] = useState('');

  const config: SpeechToTextConfig = {
    language: 'es-ES',
    silenceTimeout: 700,
    optimizedMode,
    performanceMode: PerformanceMode.SPEED, // Configure for maximum speed
    audioConfig: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    silenceDetected,
    sessionMetadata,
    audioMetrics,
    chartData,
    toggleListening,
    clearTranscript,
    copyMetadataToClipboard
  } = useSpeechToText(config);














  const toggleOptimizedMode = () => {
    setOptimizedMode(!optimizedMode);
  };

  const handleCopyToClipboard = async () => {
    const result = await copyMetadataToClipboard();
    setCopySuccess(result.message);
    
    setTimeout(() => {
      setCopySuccess('');
    }, 2000);
  };

  if (!isSupported) {
    return (
      <div className="speech-to-text">
        <div className="error-message">
          Tu navegador no soporta la API de reconocimiento de voz.
          Por favor, utiliza Chrome, Safari o Edge.
        </div>
      </div>
    );
  }

  return (
    <div className="speech-to-text">
      <div className="header">
        <h1>Reconocimiento de Voz en Tiempo Real</h1>
        <p>Presiona el botón para comenzar a hablar y ver la transcripción en tiempo real</p>
      </div>

      <div className="config-section">
        <div className="optimization-config">
          <label className="optimization-label">
            <input
              type="checkbox"
              checked={optimizedMode}
              onChange={toggleOptimizedMode}
              disabled={isListening}
              className="optimization-checkbox"
            />
            <span className="optimization-text">
              Modo optimizado para velocidad 
              <span className="optimization-details">
                {optimizedMode ? '(Más rápido, menos precisión)' : '(Más preciso, menos rápido)'}
              </span>
            </span>
          </label>
          <div className="silence-info">
            <span>Detección automática de silencio: 700ms</span>
          </div>
        </div>
      </div>

      <div className="controls">
        <button 
          className={`listen-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? (
            <>
              <span className="mic-icon">🎤</span>
              Detener
            </>
          ) : (
            <>
              <span className="mic-icon">🎤</span>
              Comenzar a escuchar
            </>
          )}
        </button>

        <button 
          className="clear-button"
          onClick={clearTranscript}
          disabled={!transcript && !interimTranscript}
        >
          Limpiar
        </button>
      </div>

      <div className="status">
        {isListening && !silenceDetected && (
          <div className="listening-indicator">
            <span className="pulse"></span>
            Escuchando...
            <div className="volume-indicator">
              <span className="volume-label">
                Volumen: {audioMetrics.volumeData.length > 0 ? 
                  `${audioMetrics.volumeData[audioMetrics.volumeData.length - 1]?.volume?.toFixed(2) || '0.00'}dB` : 
                  '0.00dB'
                } | Pitch: {audioMetrics.currentPitch > 0 ? `${audioMetrics.currentPitch.toFixed(1)}Hz` : 'N/A'}
              </span>
              <div className="volume-bar">
                <div 
                  className="volume-fill" 
                  style={{ width: `${audioMetrics.currentVolume}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        {silenceDetected && (
          <div className="silence-indicator">
            <span className="silence-icon">🔇</span>
            Silencio detectado - grabación terminada
          </div>
        )}
      </div>

      {/* Navegación por tabs */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 'speak' ? 'active' : ''}`}
          onClick={() => setActiveTab('speak')}
        >
          🎤 Hablar
        </button>
        <button 
          className={`tab-button ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
          disabled={!sessionMetadata}
        >
          📄 JSON
        </button>
        <button 
          className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
          disabled={!sessionMetadata}
        >
          📈 Gráficos
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="tab-content">
        {activeTab === 'speak' && (
          <div className="speak-tab">
            <div className="transcript-container">
              <div className="transcript">
                {transcript}
                {interimTranscript && (
                  <span className="interim">{interimTranscript}</span>
                )}
              </div>
              
              {!transcript && !interimTranscript && !isListening && (
                <div className="placeholder">
                  La transcripción aparecerá aquí...
                </div>
              )}
            </div>

            {sessionMetadata && (
              <div className="metadata-summary-card">
                <h3>Resumen de la Sesión</h3>
                <div className="metadata-summary">
                  <div className="summary-item">
                    <span className="summary-label">Duración total:</span>
                    <span className="summary-value">{Math.round(sessionMetadata.totalDuration / 1000)}s</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Palabras:</span>
                    <span className="summary-value">{sessionMetadata.words.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Volumen promedio:</span>
                    <span className="summary-value">{sessionMetadata.overallAverageVolume.toFixed(2)}dB</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Pitch promedio:</span>
                    <span className="summary-value">{sessionMetadata.overallAveragePitch.toFixed(1)}Hz</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && sessionMetadata && (
          <div className="json-tab">
            <div className="metadata-section">
              <div className="metadata-header">
                <h3>Metadata Completa de la Sesión</h3>
                <button 
                  className="copy-json-button"
                  onClick={handleCopyToClipboard}
                  title="Copiar JSON completo"
                >
                  {copySuccess ? copySuccess : '📋 Copiar JSON'}
                </button>
              </div>
              
              <div className="metadata-summary">
                <div className="summary-item">
                  <span className="summary-label">Duración total:</span>
                  <span className="summary-value">{Math.round(sessionMetadata.totalDuration / 1000)}s</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Palabras:</span>
                  <span className="summary-value">{sessionMetadata.words.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Volumen promedio:</span>
                  <span className="summary-value">{sessionMetadata.overallAverageVolume.toFixed(2)}dB</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Volumen máximo:</span>
                  <span className="summary-value">{sessionMetadata.overallPeakVolume.toFixed(2)}dB</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Volumen mínimo:</span>
                  <span className="summary-value">{sessionMetadata.overallMinVolume.toFixed(2)}dB</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pitch promedio:</span>
                  <span className="summary-value">{sessionMetadata.overallAveragePitch.toFixed(1)}Hz</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pitch máximo:</span>
                  <span className="summary-value">{sessionMetadata.overallPeakPitch.toFixed(1)}Hz</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pitch mínimo:</span>
                  <span className="summary-value">{sessionMetadata.overallMinPitch.toFixed(1)}Hz</span>
                </div>
              </div>

              <div className="metadata-json">
                <pre>{JSON.stringify(sessionMetadata, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && sessionMetadata && (
          <div className="charts-tab">
            <div className="charts-section">
              <div className="volume-chart-section">
                <h4>Progresión del Volumen Promedio</h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.volumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        type="number"
                        scale="linear"
                        domain={['dataMin', () => {
                          const words = sessionMetadata?.words || [];
                          if (words.length > 0) {
                            const lastWord = words[words.length - 1];
                            return lastWord.endTime;
                          }
                          return 'dataMax';
                        }]}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                      />
                      <YAxis 
                        domain={[0, 60]}
                        tickFormatter={(value) => `${value}dB`}
                      />
                      <Tooltip 
                        labelFormatter={(value) => `Tiempo: ${(value / 1000).toFixed(2)}s`}
                        formatter={(value: any) => [`${value.toFixed(2)}dB`, 'Volumen Promedio']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="averageVolume" 
                        stroke="#667eea" 
                        strokeWidth={2}
                        fill="rgba(102, 126, 234, 0.3)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="speech-rate-chart-section">
                <h4>Velocidad de Habla (Palabras por Minuto)</h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.speechRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        type="number"
                        scale="linear"
                        domain={['dataMin', () => {
                          const words = sessionMetadata?.words || [];
                          if (words.length > 0) {
                            const lastWord = words[words.length - 1];
                            return lastWord.endTime;
                          }
                          return 'dataMax';
                        }]}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                      />
                      <YAxis 
                        domain={[0, 'dataMax']}
                        tickFormatter={(value) => `${value} WPM`}
                      />
                      <Tooltip 
                        labelFormatter={(value) => `Tiempo: ${(value / 1000).toFixed(2)}s`}
                        formatter={(value: any) => [`${value.toFixed(1)} WPM`, 'Velocidad']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="wpm" 
                        stroke="#28a745" 
                        strokeWidth={3}
                        dot={{ fill: '#28a745', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pitch-chart-section">
                <h4>Progresión del Pitch (Frecuencia Vocal)</h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.pitchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        type="number"
                        scale="linear"
                        domain={['dataMin', () => {
                          const words = sessionMetadata?.words || [];
                          if (words.length > 0) {
                            const lastWord = words[words.length - 1];
                            return lastWord.endTime;
                          }
                          return 'dataMax';
                        }]}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
                      />
                      <YAxis 
                        domain={[0, 'dataMax']}
                        tickFormatter={(value) => `${value}Hz`}
                      />
                      <Tooltip 
                        labelFormatter={(value) => `Tiempo: ${(value / 1000).toFixed(2)}s`}
                        formatter={(value: any) => [`${value.toFixed(1)}Hz`, 'Pitch']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="averagePitch" 
                        stroke="#ff6b35" 
                        strokeWidth={3}
                        dot={{ fill: '#ff6b35', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechToText;