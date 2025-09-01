import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpeechToText, PerformanceMode } from 'react-speech-to-text-gk';

// Tipos TypeScript para mejor desarrollo
interface SpeechEvent {
  id: number;
  type: 'speech_start' | 'speech_end' | 'silence_detected' | 'error';
  timestamp: number;
  message: string;
  duration?: number;
  volume?: number;
}

interface SilenceCountdown {
  isActive: boolean;
  percentage: number;
  timeLeft: number;
}

interface SpeechSession {
  isCurrentlySpeaking: boolean;
  totalSpeechTime: number;
  totalSilenceTime: number;
  speechSegments: number;
  currentSessionStart?: number;
}

const SpeechDetectionDemo: React.FC = () => {
  // Estados de configuración
  const [speechVolumeThreshold, setSpeechVolumeThreshold] = useState(15);
  const [speechPauseThreshold, setSpeechPauseThreshold] = useState(200);
  const [isRealTimeLogging, setIsRealTimeLogging] = useState(true);
  const [language, setLanguage] = useState('es-ES');
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(PerformanceMode.BALANCED);

  // Estados de la sesión
  const [speechEvents, setSpeechEvents] = useState<SpeechEvent[]>([]);
  const [silenceCountdown, setSilenceCountdown] = useState<SilenceCountdown>({
    isActive: false,
    percentage: 100,
    timeLeft: 0
  });
  const [speechSession, setSpeechSession] = useState<SpeechSession>({
    isCurrentlySpeaking: false,
    totalSpeechTime: 0,
    totalSilenceTime: 0,
    speechSegments: 0
  });

  // Referencias para gestión de estado
  const lastSpeechEndRef = useRef(0);
  const eventIdRef = useRef(0);
  const silenceCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechActivityRef = useRef(0);
  const silenceStartTimeRef = useRef(0);

  // Hook principal de speech-to-text
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    silenceDetected,
    sessionMetadata,
    audioMetrics,
    chartData,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechToText({
    language,
    silenceTimeout: speechPauseThreshold,
    performanceMode,
    speechVolumeThreshold,
    speechPauseThreshold,
    onSpeechStart: useCallback((data: any) => {
      const currentTime = Date.now();
      const eventId = ++eventIdRef.current;
      
      lastSpeechActivityRef.current = currentTime;
      
      // REINICIAR el countdown de silencio cuando se detecta habla
      stopSilenceCountdown();
      setSilenceCountdown({
        isActive: false,
        percentage: 100, // Al 100% cuando se habla
        timeLeft: speechPauseThreshold
      });
      
      // Calcular duración de silencio anterior
      const silenceDuration = lastSpeechEndRef.current > 0 
        ? currentTime - lastSpeechEndRef.current 
        : 0;

      if (isRealTimeLogging) {
        const newEvent: SpeechEvent = {
          id: eventId,
          type: 'speech_start',
          timestamp: currentTime,
          message: `🎤 Habla detectada`,
          duration: silenceDuration > 0 ? silenceDuration : undefined,
          volume: data?.volume
        };
        
        setSpeechEvents(prev => [newEvent, ...prev].slice(0, 100));
      }

      // Actualizar estado de sesión
      setSpeechSession(prev => ({
        ...prev,
        isCurrentlySpeaking: true,
        currentSessionStart: currentTime,
        speechSegments: prev.speechSegments + 1,
        totalSilenceTime: prev.totalSilenceTime + (silenceDuration || 0)
      }));

      // Detener countdown de silencio
      // stopSilenceCountdown(); // Ya no necesario aquí, se hace arriba
    }, [isRealTimeLogging, speechPauseThreshold]),

    onSpeechEnd: useCallback((data: any) => {
      const currentTime = Date.now();
      const eventId = ++eventIdRef.current;
      
      lastSpeechEndRef.current = currentTime;
      silenceStartTimeRef.current = currentTime; // Marcar inicio del silencio
      
      // INICIAR countdown de silencio
      startSilenceCountdown();
      
      // Calcular duración del habla
      const speechDuration = speechSession.currentSessionStart 
        ? currentTime - speechSession.currentSessionStart 
        : 0;

      if (isRealTimeLogging) {
        const newEvent: SpeechEvent = {
          id: eventId,
          type: 'speech_end',
          timestamp: currentTime,
          message: `⏸️ Habla terminada - Iniciando countdown`,
          duration: speechDuration,
          volume: data?.volume
        };
        
        setSpeechEvents(prev => [newEvent, ...prev].slice(0, 100));
      }

      // Actualizar estado de sesión
      setSpeechSession(prev => ({
        ...prev,
        isCurrentlySpeaking: false,
        totalSpeechTime: prev.totalSpeechTime + speechDuration,
        currentSessionStart: undefined
      }));

      // Iniciar countdown de silencio
      startSilenceCountdown();
    }, [isRealTimeLogging, speechSession.currentSessionStart]),

    onSilenceDetected: useCallback((data: any) => {
      const eventId = ++eventIdRef.current;
      
      const newEvent: SpeechEvent = {
        id: eventId,
        type: 'silence_detected',
        timestamp: Date.now(),
        message: `🔇 Silencio detectado`,
        duration: data?.duration
      };
      
      setSpeechEvents(prev => [newEvent, ...prev].slice(0, 100));
    }, []),

    onError: useCallback((error: any) => {
      console.error('Error de reconocimiento:', error);
      const eventId = ++eventIdRef.current;
      
      const newEvent: SpeechEvent = {
        id: eventId,
        type: 'error',
        timestamp: Date.now(),
        message: `❌ Error: ${error.message || 'Error desconocido'}`
      };
      
      setSpeechEvents(prev => [newEvent, ...prev].slice(0, 100));
    }, [])
  });

  // Funciones auxiliares
  const startSilenceCountdown = useCallback(() => {
    const silenceTimeout = speechPauseThreshold; // En ms
    const updateInterval = 50; // Actualizar cada 50ms
    
    setSilenceCountdown({
      isActive: true,
      percentage: 100,
      timeLeft: silenceTimeout
    });
    
    silenceCountdownIntervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - silenceStartTimeRef.current;
      const remaining = Math.max(0, silenceTimeout - elapsed);
      const percentage = (remaining / silenceTimeout) * 100;
      
      setSilenceCountdown({
        isActive: remaining > 0,
        percentage: Math.round(percentage),
        timeLeft: remaining
      });
      
      if (remaining <= 0) {
        // Silencio detectado - finalizar countdown
        const eventId = ++eventIdRef.current;
        const newEvent: SpeechEvent = {
          id: eventId,
          type: 'silence_detected',
          timestamp: Date.now(),
          message: `🔇 Silencio final detectado (${speechPauseThreshold}ms)`,
          duration: silenceTimeout
        };
        
        setSpeechEvents(prev => [newEvent, ...prev].slice(0, 100));
        stopSilenceCountdown();
      }
    }, updateInterval);
  }, [speechPauseThreshold]);

  const stopSilenceCountdown = useCallback(() => {
    if (silenceCountdownIntervalRef.current) {
      clearInterval(silenceCountdownIntervalRef.current);
      silenceCountdownIntervalRef.current = null;
    }
    
    setSilenceCountdown({
      isActive: false,
      percentage: 100,
      timeLeft: 0
    });
  }, []);

  // Efectos
  useEffect(() => {
    if (!isListening) {
      setSpeechSession({
        isCurrentlySpeaking: false,
        totalSpeechTime: 0,
        totalSilenceTime: 0,
        speechSegments: 0
      });
      lastSpeechEndRef.current = 0;
      stopSilenceCountdown();
    }
    
    return () => {
      stopSilenceCountdown();
    };
  }, [isListening, stopSilenceCountdown]);

  // Funciones de utilidad
  const formatDuration = (ms: number): string => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const clearEvents = () => {
    setSpeechEvents([]);
    eventIdRef.current = 0;
  };

  const handleStartListening = async () => {
    try {
      await startListening();
    } catch (error) {
      console.error('Error al iniciar:', error);
    }
  };

  const handleStopListening = () => {
    stopListening();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🎯 Detección de Habla en Tiempo Real</h1>
        <p>Demo React usando react-speech-to-text-gk con análisis de audio</p>
        <div style={styles.newFeature}>
          🆕 REACT HOOKS: useSpeechToText + useAudioAnalysis con TypeScript
        </div>
      </div>

      <div style={styles.content}>
        {!isSupported && (
          <div style={styles.error}>
            <strong>⚠️ Tu navegador no soporta Speech Recognition</strong>
            <br />
            Prueba con Chrome, Edge o Safari para la mejor experiencia.
          </div>
        )}

        {/* Configuración */}
        <div style={styles.configSection}>
          <h3>⚙️ Configuración de Detección</h3>
          <div style={styles.controls}>
            <div style={styles.controlGroup}>
              <h4>🔊 Umbral de Volumen ({speechVolumeThreshold}%)</h4>
              <input
                type="range"
                style={styles.slider}
                min="5"
                max="50"
                value={speechVolumeThreshold}
                onChange={(e) => setSpeechVolumeThreshold(Number(e.target.value))}
                disabled={isListening}
              />
              <small>Volumen mínimo para detectar habla</small>
              <div style={styles.audioVisualizer}>
                <div 
                  style={{
                    ...styles.audioVisualizerBar,
                    width: `${Math.min(100, audioMetrics.currentVolume)}%`,
                    backgroundColor: audioMetrics.currentVolume > speechVolumeThreshold ? '#28a745' : '#ffc107'
                  }}
                />
              </div>
            </div>

            <div style={styles.controlGroup}>
              <h4>⏱️ Umbral de Pausa ({speechPauseThreshold}ms)</h4>
              <input
                type="range"
                style={styles.slider}
                min="100"
                max="2000"
                step="50"
                value={speechPauseThreshold}
                onChange={(e) => setSpeechPauseThreshold(Number(e.target.value))}
                disabled={isListening}
              />
              <small>Tiempo de silencio antes de detectar pausa</small>
            </div>

            <div style={styles.controlGroup}>
              <h4>🌍 Idioma</h4>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isListening}
                style={styles.select}
              >
                <option value="es-ES">🇪🇸 Español (España)</option>
                <option value="es-AR">🇦🇷 Español (Argentina)</option>
                <option value="es-MX">🇲🇽 Español (México)</option>
                <option value="en-US">🇺🇸 English (US)</option>
                <option value="en-GB">🇬🇧 English (UK)</option>
                <option value="fr-FR">🇫🇷 Français</option>
                <option value="de-DE">🇩🇪 Deutsch</option>
                <option value="it-IT">🇮🇹 Italiano</option>
                <option value="pt-BR">🇧🇷 Português (Brasil)</option>
              </select>
            </div>

            <div style={styles.controlGroup}>
              <h4>📊 Análisis de Audio</h4>
              <div>
                <strong>Volumen:</strong> {audioMetrics.currentVolume ? `${audioMetrics.currentVolume.toFixed(1)}%` : 'N/A'}
              </div>
              <div>
                <strong>Tono:</strong> {audioMetrics.currentPitch ? `${audioMetrics.currentPitch.toFixed(1)} Hz` : 'N/A'}
              </div>
              <div>
                <strong>Estado:</strong> {isListening ? '🎤 Escuchando' : '⏸️ Detenido'}
              </div>
              {sessionMetadata && (
                <div>
                  <strong>Palabras detectadas:</strong> {sessionMetadata.words.length}
                </div>
              )}
            </div>
          </div>

          <div style={styles.toggleGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isRealTimeLogging}
                onChange={(e) => setIsRealTimeLogging(e.target.checked)}
              />
              📝 Logging en tiempo real
            </label>
          </div>
        </div>

        {/* Controles principales */}
        <div style={styles.buttons}>
          <button
            style={{
              ...styles.btn,
              ...styles.startBtn,
              opacity: (!isSupported || isListening) ? 0.5 : 1
            }}
            onClick={handleStartListening}
            disabled={!isSupported || isListening}
          >
            ▶️ Iniciar Detección
          </button>
          
          <button
            style={{
              ...styles.btn,
              ...styles.stopBtn,
              opacity: (!isSupported || !isListening) ? 0.5 : 1
            }}
            onClick={handleStopListening}
            disabled={!isSupported || !isListening}
          >
            ⏹️ Detener Detección
          </button>
          
          <button
            style={{
              ...styles.btn,
              ...styles.clearBtn
            }}
            onClick={clearTranscript}
          >
            🗑️ Limpiar Transcripción
          </button>
        </div>

        {/* BARRA DE COUNTDOWN DE SILENCIO */}
        {isListening && (
          <div style={styles.silenceCountdownContainer}>
            <div style={styles.silenceCountdownHeader}>
              <h3>⏱️ Countdown de Silencio</h3>
              <div style={styles.silenceCountdownInfo}>
                {silenceCountdown.isActive ? (
                  <>
                    <span style={styles.countdownActive}>
                      🔻 Detectando silencio... {formatDuration(silenceCountdown.timeLeft)}
                    </span>
                    <span style={styles.countdownPercentage}>
                      {silenceCountdown.percentage}%
                    </span>
                  </>
                ) : speechSession.isCurrentlySpeaking ? (
                  <span style={styles.countdownSpeaking}>
                    🎤 Hablando - Countdown pausado
                  </span>
                ) : (
                  <span style={styles.countdownReady}>
                    ⏸️ Listo para detectar silencio
                  </span>
                )}
              </div>
            </div>
            <div style={styles.progressBarContainer}>
              <div 
                style={{
                  ...styles.progressBarFill,
                  width: `${silenceCountdown.percentage}%`,
                  backgroundColor: silenceCountdown.isActive 
                    ? (silenceCountdown.percentage > 50 ? '#28a745' : silenceCountdown.percentage > 20 ? '#ffc107' : '#dc3545')
                    : speechSession.isCurrentlySpeaking ? '#28a745' : '#6c757d'
                }}
              />
            </div>
            <div style={styles.progressLabels}>
              <span>0%</span>
              <span style={styles.silenceThresholdLabel}>
                Umbral: {speechPauseThreshold}ms
              </span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Estado de la sesión */}
        {isListening && (
          <div style={styles.sessionStatus}>
            <h3>📈 Estado de la Sesión</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Estado actual:</span>
                <span style={speechSession.isCurrentlySpeaking ? styles.speaking : styles.silent}>
                  {speechSession.isCurrentlySpeaking ? '🎤 Hablando' : '🔇 Silencio'}
                </span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Segmentos de habla:</span>
                <span>{speechSession.speechSegments}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Tiempo total hablando:</span>
                <span>{formatDuration(speechSession.totalSpeechTime)}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Tiempo total en silencio:</span>
                <span>{formatDuration(speechSession.totalSilenceTime)}</span>
              </div>
            </div>

            {/* Countdown de silencio */}
            {silenceCountdown.isActive && (
              <div style={styles.silenceCountdown}>
                <div style={styles.silenceCountdownHeader}>
                  ⏳ Detectando silencio... {formatDuration(silenceCountdown.timeLeft)}
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressBarFill,
                      width: `${silenceCountdown.percentage}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcripción */}
        <div style={styles.transcript}>
          <h3>📝 Transcripción</h3>
          <div style={styles.transcriptContent}>
            {transcript && (
              <p><strong>Texto final:</strong> {transcript}</p>
            )}
            {interimTranscript && (
              <p style={styles.interim}>
                <strong>Texto temporal:</strong> <em>{interimTranscript}</em>
              </p>
            )}
            {!transcript && !interimTranscript && (
              <p style={styles.placeholder}>
                Presiona "Iniciar Detección" y comienza a hablar...
              </p>
            )}
          </div>
        </div>

        {/* Eventos en tiempo real */}
        {isRealTimeLogging && (
          <div style={styles.eventsContainer}>
            <div style={styles.eventsHeader}>
              <h3>⚡ Eventos en Tiempo Real</h3>
              <button 
                style={styles.clearEventsBtn}
                onClick={clearEvents}
              >
                🗑️ Limpiar
              </button>
            </div>
            <div style={styles.eventsList}>
              {speechEvents.length === 0 ? (
                <div style={styles.noEvents}>
                  No hay eventos registrados. Inicia la detección para ver eventos en tiempo real.
                </div>
              ) : (
                speechEvents.map((event) => {
                  // Determinar estilo basado en el tipo de evento
                  const getEventStyle = () => {
                    const baseStyle = {
                      background: 'white',
                      margin: '8px 0',
                      padding: '12px 15px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #ddd',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      animation: 'slideIn 0.3s ease'
                    };

                    switch (event.type) {
                      case 'speech_start':
                        return {
                          ...baseStyle,
                          borderLeftColor: '#28a745',
                          background: 'linear-gradient(90deg, #d4edda 0%, white 20%)'
                        };
                      case 'speech_end':
                        return {
                          ...baseStyle,
                          borderLeftColor: '#ffc107',
                          background: 'linear-gradient(90deg, #fff3cd 0%, white 20%)'
                        };
                      case 'silence_detected':
                        return {
                          ...baseStyle,
                          borderLeftColor: '#dc3545',
                          background: 'linear-gradient(90deg, #f8d7da 0%, white 20%)'
                        };
                      case 'error':
                        return {
                          ...baseStyle,
                          borderLeftColor: '#dc3545',
                          background: 'linear-gradient(90deg, #f8d7da 0%, white 20%)'
                        };
                      default:
                        return baseStyle;
                    }
                  };

                  return (
                    <div 
                      key={event.id} 
                      style={getEventStyle()}
                    >
                    <div style={styles.eventHeader}>
                      <span style={styles.eventMessage}>{event.message}</span>
                      <span style={styles.eventTime}>{formatTime(event.timestamp)}</span>
                    </div>
                    {event.duration && (
                      <div style={styles.eventDuration}>
                        Duración: {formatDuration(event.duration)}
                      </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}        {/* Instrucciones */}
        <div style={styles.instructions}>
          <h3>💡 Instrucciones de Uso</h3>
          <ul style={styles.instructionsList}>
            <li>Configura el umbral de volumen según tu micrófono</li>
            <li>Ajusta el umbral de pausa para controlar la sensibilidad</li>
            <li>Selecciona tu idioma preferido antes de iniciar</li>
            <li>Usa el análisis de audio para monitorear volumen y tono</li>
            <li>Los eventos se registran en tiempo real para debugging</li>
            <li>Funciona mejor en Chrome y Edge para máxima compatibilidad</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Estilos con tipado completo
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
    overflow: 'hidden' as const
  },
  header: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
    padding: '30px',
    textAlign: 'center' as const
  },
  newFeature: {
    background: 'rgba(255, 193, 7, 0.9)',
    color: '#333',
    padding: '15px',
    borderRadius: '10px',
    marginTop: '20px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    border: '2px solid #ffc107'
  },
  content: {
    padding: '30px'
  },
  configSection: {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '10px',
    marginBottom: '25px',
    border: '1px solid #dee2e6'
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  controlGroup: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  slider: {
    width: '100%',
    margin: '10px 0'
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  toggleGroup: {
    marginTop: '15px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  audioVisualizer: {
    height: '4px',
    background: '#e9ecef',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '8px'
  },
  audioVisualizerBar: {
    height: '100%',
    transition: 'width 0.1s ease',
    borderRadius: '2px'
  },
  buttons: {
    textAlign: 'center' as const,
    margin: '30px 0'
  },
  btn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    margin: '10px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  startBtn: {
    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
  },
  stopBtn: {
    background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
  },
  clearBtn: {
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    color: '#333'
  },
  sessionStatus: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid #dee2e6'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: 'white',
    borderRadius: '5px'
  },
  statLabel: {
    fontWeight: 'bold'
  },
  speaking: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  silent: {
    color: '#6c757d',
    fontWeight: 'bold'
  },
  silenceCountdown: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ffc107'
  },
  progressBar: {
    height: '8px',
    background: '#f8f9fa',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffc107, #fd7e14)',
    transition: 'width 0.1s ease'
  },
  transcript: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '10px',
    padding: '20px',
    margin: '20px 0',
    minHeight: '100px'
  },
  transcriptContent: {
    marginTop: '10px'
  },
  interim: {
    color: '#6c757d',
    fontStyle: 'italic',
    animation: 'typing 1s infinite'
  },
  placeholder: {
    color: '#6c757d',
    fontStyle: 'italic'
  },
  eventsContainer: {
    background: '#f8f9fa',
    borderRadius: '10px',
    margin: '20px 0',
    overflow: 'hidden'
  },
  eventsHeader: {
    background: '#343a40',
    color: 'white',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clearEventsBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  eventsList: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
    padding: '15px'
  },
  noEvents: {
    textAlign: 'center' as const,
    color: '#6c757d',
    fontStyle: 'italic',
    padding: '20px'
  },
  event: {
    background: 'white',
    margin: '8px 0',
    padding: '12px 15px',
    borderRadius: '8px',
    borderLeft: '4px solid #ddd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    animation: 'slideIn 0.3s ease'
  },
  eventstart: {
    borderLeftColor: '#28a745',
    background: 'linear-gradient(90deg, #d4edda 0%, white 20%)'
  },
  eventend: {
    borderLeftColor: '#ffc107',
    background: 'linear-gradient(90deg, #fff3cd 0%, white 20%)'
  },
  eventsilence: {
    borderLeftColor: '#dc3545',
    background: 'linear-gradient(90deg, #f8d7da 0%, white 20%)'
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  eventMessage: {
    fontWeight: 'bold'
  },
  eventTime: {
    fontSize: '12px',
    color: '#6c757d'
  },
  eventDuration: {
    fontSize: '12px',
    color: '#6c757d',
    marginTop: '5px'
  },
  instructions: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '25px',
    borderRadius: '10px',
    marginTop: '30px'
  },
  instructionsList: {
    listStyle: 'none',
    padding: 0
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    margin: '20px 0',
    border: '1px solid #f5c6cb'
  },
  // Estilos para la barra de countdown de silencio
  silenceCountdownContainer: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #007bff',
    boxShadow: '0 4px 8px rgba(0,123,255,0.1)'
  },
  silenceCountdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  silenceCountdownInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    fontSize: '14px'
  },
  countdownActive: {
    color: '#dc3545',
    fontWeight: 'bold'
  },
  countdownPercentage: {
    background: '#007bff',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  countdownSpeaking: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  countdownReady: {
    color: '#6c757d',
    fontWeight: 'bold'
  },
  progressBarContainer: {
    height: '12px',
    background: '#e9ecef',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '8px',
    border: '1px solid #dee2e6'
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#6c757d'
  },
  silenceThresholdLabel: {
    fontWeight: 'bold',
    color: '#007bff'
  }
} as const;

export default SpeechDetectionDemo;
