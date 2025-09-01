import React, { useState, useRef, useEffect } from 'react';
import { useSpeechToText, SpeechStartData, SpeechEndData, SilenceDetectedData } from 'react-speech-to-text-gk';

const SpeechDetectionExample: React.FC = () => {
    const [speechVolumeThreshold, setSpeechVolumeThreshold] = useState(15);
    const [speechPauseThreshold, setSpeechPauseThreshold] = useState(200);
    const [isRealTimeLogging, setIsRealTimeLogging] = useState(true);
    
    // Estado para eventos de habla con más detalles
    const [speechEvents, setSpeechEvents] = useState<Array<{
        id: number;
        type: 'start' | 'end' | 'silence';
        timestamp: number;
        data: any;
        duration?: number;
    }>>([]);
    
    const [speechSession, setSpeechSession] = useState<{
        isCurrentlySpeaking: boolean;
        currentSessionStart?: number;
        totalSpeechTime: number;
        totalSilenceTime: number;
        speechSegments: number;
    }>({
        isCurrentlySpeaking: false,
        totalSpeechTime: 0,
        totalSilenceTime: 0,
        speechSegments: 0
    });

    const lastSpeechEndRef = useRef<number>(0);
    const eventIdRef = useRef<number>(0);

    const {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        audioMetrics,
        startListening,
        stopListening,
        clearTranscript
    } = useSpeechToText({
        language: 'es-ES',
        speechVolumeThreshold,
        speechPauseThreshold,
        silenceTimeout: 2000,
        onSpeechStart: (data: SpeechStartData) => {
            const currentTime = Date.now();
            const eventId = ++eventIdRef.current;
            
            // Calcular tiempo de silencio antes de empezar a hablar
            const silenceDuration = lastSpeechEndRef.current > 0 
                ? currentTime - lastSpeechEndRef.current 
                : 0;
            
            setSpeechSession(prev => ({
                ...prev,
                isCurrentlySpeaking: true,
                currentSessionStart: currentTime,
                totalSilenceTime: prev.totalSilenceTime + silenceDuration,
                speechSegments: prev.speechSegments + 1
            }));

            setSpeechEvents(prev => [...prev.slice(-19), {
                id: eventId,
                type: 'start',
                timestamp: currentTime,
                data: {
                    ...data,
                    silenceBeforeSpeech: silenceDuration
                }
            }]);

            if (isRealTimeLogging) {
                console.log('🎤 INICIO DE HABLA:', {
                    volumen: data.triggerVolume.toFixed(1),
                    pitch: data.startPitch.toFixed(1),
                    silencioAnterior: silenceDuration + 'ms'
                });
            }
        },
        onSpeechEnd: (data: SpeechEndData) => {
            const currentTime = Date.now();
            const eventId = ++eventIdRef.current;
            lastSpeechEndRef.current = currentTime;
            
            // Calcular duración del segmento de habla
            const speechDuration = speechSession.currentSessionStart 
                ? currentTime - speechSession.currentSessionStart 
                : 0;

            setSpeechSession(prev => ({
                ...prev,
                isCurrentlySpeaking: false,
                currentSessionStart: undefined,
                totalSpeechTime: prev.totalSpeechTime + speechDuration
            }));

            setSpeechEvents(prev => [...prev.slice(-19), {
                id: eventId,
                type: 'end',
                timestamp: currentTime,
                data: {
                    ...data,
                    speechDuration
                },
                duration: speechDuration
            }]);

            if (isRealTimeLogging) {
                console.log('🤐 FIN DE HABLA:', {
                    duracionHabla: speechDuration + 'ms',
                    pausa: data.pauseDuration + 'ms',
                    volumenFinal: data.endVolume.toFixed(1)
                });
            }
        },
        onSilenceDetected: (data: SilenceDetectedData) => {
            const eventId = ++eventIdRef.current;
            
            setSpeechEvents(prev => [...prev.slice(-19), {
                id: eventId,
                type: 'silence',
                timestamp: Date.now(),
                data
            }]);

            if (isRealTimeLogging) {
                console.log('🔇 SILENCIO DETECTADO:', {
                    tiempoSinHabla: data.timeSinceLastSpeech + 'ms',
                    timeout: data.silenceTimeout + 'ms'
                });
            }
        }
    });

    // Limpiar eventos cuando se para la escucha
    useEffect(() => {
        if (!isListening) {
            setSpeechSession({
                isCurrentlySpeaking: false,
                totalSpeechTime: 0,
                totalSilenceTime: 0,
                speechSegments: 0
            });
            lastSpeechEndRef.current = 0;
        }
    }, [isListening]);

    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1000px',
            margin: '20px auto',
            padding: '20px'
        },
        header: {
            textAlign: 'center' as const,
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#e8f4fd',
            borderRadius: '10px',
            border: '2px solid #3498db'
        },
        configSection: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #dee2e6'
        },
        metricsSection: {
            display: 'grid' as const,
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
        },
        metricCard: {
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        eventsContainer: {
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginBottom: '20px'
        },
        eventsList: {
            maxHeight: '300px',
            overflowY: 'auto' as const,
            padding: '10px'
        },
        event: {
            padding: '8px 12px',
            margin: '5px 0',
            borderRadius: '6px',
            fontSize: '13px',
            border: '1px solid #e9ecef'
        },
        eventStart: {
            backgroundColor: '#d4edda',
            borderColor: '#c3e6cb'
        },
        eventEnd: {
            backgroundColor: '#fff3cd',
            borderColor: '#ffeaa7'
        },
        eventSilence: {
            backgroundColor: '#f8d7da',
            borderColor: '#f5c6cb'
        },
        button: {
            padding: '12px 24px',
            margin: '5px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
        },
        primaryButton: {
            backgroundColor: '#28a745',
            color: 'white'
        },
        dangerButton: {
            backgroundColor: '#dc3545',
            color: 'white'
        },
        secondaryButton: {
            backgroundColor: '#6c757d',
            color: 'white'
        },
        transcript: {
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            minHeight: '100px'
        },
        status: {
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: 'bold',
            textAlign: 'center' as const
        },
        listening: {
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb'
        },
        notListening: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb'
        }
    };

    const formatDuration = (ms: number) => {
        return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('es-ES', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🎯 Detección de Habla en Tiempo Real</h1>
                <p>Monitoreo avanzado de inicio y fin de habla con métricas detalladas</p>
            </div>

            {!isSupported && (
                <div style={{...styles.status, backgroundColor: '#f8d7da', color: '#721c24'}}>
                    ⚠️ Tu navegador no soporta Speech Recognition
                </div>
            )}

            <div style={styles.configSection}>
                <h3>⚙️ Configuración de Detección</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px'}}>
                    <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                            Umbral de Volumen ({speechVolumeThreshold}%):
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={speechVolumeThreshold}
                            onChange={(e) => setSpeechVolumeThreshold(Number(e.target.value))}
                            disabled={isListening}
                            style={{width: '100%'}}
                        />
                        <small style={{color: '#666'}}>Volumen mínimo para detectar habla</small>
                    </div>
                    
                    <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                            Pausa para Fin ({speechPauseThreshold}ms):
                        </label>
                        <input
                            type="range"
                            min="100"
                            max="1000"
                            step="50"
                            value={speechPauseThreshold}
                            onChange={(e) => setSpeechPauseThreshold(Number(e.target.value))}
                            disabled={isListening}
                            style={{width: '100%'}}
                        />
                        <small style={{color: '#666'}}>Duración de pausa para detectar fin</small>
                    </div>
                </div>

                <div style={{marginTop: '15px'}}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isRealTimeLogging}
                            onChange={(e) => setIsRealTimeLogging(e.target.checked)}
                            style={{marginRight: '8px'}}
                        />
                        Logging en tiempo real en consola
                    </label>
                </div>
            </div>

            <div style={{...styles.status, ...(isListening ? styles.listening : styles.notListening)}}>
                {isListening ? (
                    <>
                        🎤 ESCUCHANDO - {speechSession.isCurrentlySpeaking ? 'HABLANDO' : 'EN SILENCIO'}
                        <br />
                        <small>Volumen actual: {audioMetrics.currentVolume.toFixed(1)}% | 
                        Pitch: {audioMetrics.currentPitch.toFixed(1)}Hz</small>
                    </>
                ) : (
                    '⏸️ DETENIDO - Presiona "Iniciar" para comenzar la detección'
                )}
            </div>

            {isListening && (
                <div style={styles.metricsSection}>
                    <div style={styles.metricCard}>
                        <h4 style={{margin: '0 0 10px 0', color: '#28a745'}}>📊 Métricas de Sesión</h4>
                        <div><strong>Segmentos de habla:</strong> {speechSession.speechSegments}</div>
                        <div><strong>Tiempo hablando:</strong> {formatDuration(speechSession.totalSpeechTime)}</div>
                        <div><strong>Tiempo en silencio:</strong> {formatDuration(speechSession.totalSilenceTime)}</div>
                    </div>
                    
                    <div style={styles.metricCard}>
                        <h4 style={{margin: '0 0 10px 0', color: '#dc3545'}}>🔊 Audio en Tiempo Real</h4>
                        <div><strong>Volumen:</strong> {audioMetrics.currentVolume.toFixed(1)}%</div>
                        <div><strong>Pitch:</strong> {audioMetrics.currentPitch.toFixed(1)}Hz</div>
                        <div><strong>Centroide:</strong> {audioMetrics.currentSpectralCentroid.toFixed(1)}Hz</div>
                    </div>
                </div>
            )}

            <div style={styles.eventsContainer}>
                <div style={{padding: '15px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa'}}>
                    <h3 style={{margin: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        📅 Eventos de Habla (Últimos 20)
                        <button
                            onClick={() => setSpeechEvents([])}
                            style={{...styles.button, ...styles.secondaryButton, padding: '5px 10px', fontSize: '12px'}}
                        >
                            Limpiar
                        </button>
                    </h3>
                </div>
                
                <div style={styles.eventsList}>
                    {speechEvents.length === 0 ? (
                        <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                            No hay eventos aún. Inicia la escucha y comienza a hablar.
                        </div>
                    ) : (
                        speechEvents.slice().reverse().map((event) => {
                            let style = {...styles.event};
                            let icon = '';
                            let description = '';
                            
                            switch (event.type) {
                                case 'start':
                                    style = {...style, ...styles.eventStart};
                                    icon = '🎤';
                                    description = `INICIO - Vol: ${event.data.triggerVolume?.toFixed(1)}%, Pitch: ${event.data.startPitch?.toFixed(1)}Hz`;
                                    if (event.data.silenceBeforeSpeech > 0) {
                                        description += `, Silencio anterior: ${formatDuration(event.data.silenceBeforeSpeech)}`;
                                    }
                                    break;
                                case 'end':
                                    style = {...style, ...styles.eventEnd};
                                    icon = '🤐';
                                    description = `FIN - Duración: ${formatDuration(event.duration || 0)}, Pausa: ${event.data.pauseDuration}ms`;
                                    break;
                                case 'silence':
                                    style = {...style, ...styles.eventSilence};
                                    icon = '🔇';
                                    description = `SILENCIO - ${formatDuration(event.data.timeSinceLastSpeech)} sin habla`;
                                    break;
                            }
                            
                            return (
                                <div key={event.id} style={style}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div>
                                            <span style={{marginRight: '8px'}}>{icon}</span>
                                            <strong>{formatTime(event.timestamp)}</strong>
                                            <span style={{marginLeft: '10px'}}>{description}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div style={styles.transcript}>
                <h3>📝 Transcripción</h3>
                <div>
                    <strong>Texto final:</strong>
                    <div style={{marginTop: '10px', lineHeight: '1.5'}}>
                        {transcript || <span style={{color: '#999'}}>Nada transcrito aún...</span>}
                    </div>
                </div>
                {interimTranscript && (
                    <div style={{marginTop: '15px'}}>
                        <strong>Texto en progreso:</strong>
                        <div style={{marginTop: '5px', color: '#666', fontStyle: 'italic'}}>
                            {interimTranscript}
                        </div>
                    </div>
                )}
            </div>

            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <button
                    onClick={startListening}
                    disabled={!isSupported || isListening}
                    style={{...styles.button, ...styles.primaryButton}}
                >
                    🎤 Iniciar Detección
                </button>
                
                <button
                    onClick={stopListening}
                    disabled={!isSupported || !isListening}
                    style={{...styles.button, ...styles.dangerButton}}
                >
                    ⏹️ Detener
                </button>
                
                <button
                    onClick={clearTranscript}
                    disabled={!isSupported}
                    style={{...styles.button, ...styles.secondaryButton}}
                >
                    🗑️ Limpiar
                </button>
            </div>

            <div style={{backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px', fontSize: '14px'}}>
                <h4>💡 Instrucciones de uso:</h4>
                <ul style={{marginBottom: '15px'}}>
                    <li><strong>Configura los umbrales</strong> según tu micrófono y entorno</li>
                    <li><strong>Inicia la detección</strong> y comienza a hablar</li>
                    <li><strong>Observa los eventos</strong> de inicio/fin de habla en tiempo real</li>
                    <li><strong>Activa el logging</strong> para ver detalles en la consola del navegador</li>
                </ul>
                
                <h4>🔍 Qué observar:</h4>
                <ul>
                    <li><strong>🎤 Eventos de inicio:</strong> Se activan cuando superas el umbral de volumen</li>
                    <li><strong>🤐 Eventos de fin:</strong> Se activan tras la pausa configurada</li>
                    <li><strong>🔇 Eventos de silencio:</strong> Timeout largo (2s) para detener la sesión</li>
                </ul>
            </div>
        </div>
    );
};

export default SpeechDetectionExample;