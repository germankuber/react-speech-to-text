import React, { useState, useEffect } from 'react';
import { useAudioAnalysis, useSpeechToText, PerformanceMode } from 'react-speech-to-text-gk';

const AudioAnalysisExample: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [volume, setVolume] = useState(0);
    const [pitch, setPitch] = useState(0);

    const {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        startListening,
        stopListening,
        clearTranscript
    } = useSpeechToText({
        language: 'es-ES'
    });

    const {
        initializeAudioAnalysis,
        stopAudioAnalysis,
        getAudioData,
        clearAudioData
    } = useAudioAnalysis(PerformanceMode.BALANCED);

    // Polling para obtener datos de audio en tiempo real
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAnalyzing) {
            interval = setInterval(() => {
                const audioData = getAudioData();
                setVolume(audioData.currentVolume);
                setPitch(audioData.currentPitch);
            }, 100); // Actualizar cada 100ms
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAnalyzing, getAudioData]);

    const startAnalyzing = async () => {
        try {
            await initializeAudioAnalysis();
            setIsAnalyzing(true);
        } catch (error) {
            console.error('Error al iniciar análisis de audio:', error);
        }
    };

    const stopAnalyzing = () => {
        stopAudioAnalysis();
        setIsAnalyzing(false);
        setVolume(0);
        setPitch(0);
    };

    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '800px',
            margin: '50px auto',
            padding: '20px'
        },
        button: {
            padding: '10px 20px',
            margin: '10px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        },
        startButton: {
            backgroundColor: '#4CAF50',
            color: 'white'
        },
        stopButton: {
            backgroundColor: '#f44336',
            color: 'white'
        },
        clearButton: {
            backgroundColor: '#008CBA',
            color: 'white'
        },
        audioSection: {
            backgroundColor: '#f0f8ff',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
        },
        volumeMeter: {
            width: '100%',
            height: '20px',
            backgroundColor: '#e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative' as const,
            marginTop: '10px'
        },
        volumeBar: {
            height: '100%',
            borderRadius: '10px',
            transition: 'width 0.1s ease-out'
        },
        transcript: {
            border: '1px solid #ddd',
            padding: '15px',
            margin: '20px 0',
            minHeight: '100px',
            backgroundColor: '#f9f9f9',
            borderRadius: '5px'
        },
        status: {
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0'
        },
        listening: {
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb'
        },
        notListening: {
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb'
        },
        errorMessage: {
            color: 'red',
            padding: '10px',
            backgroundColor: '#fee',
            borderRadius: '5px'
        },
        interim: {
            color: '#666',
            fontStyle: 'italic'
        },
        placeholder: {
            color: '#999'
        },
        volumeText: {
            fontSize: '14px',
            color: '#666',
            marginTop: '5px'
        }
    };

    const getVolumeColor = (volume: number): string => {
        if (volume < 20) return '#28a745'; // Verde
        if (volume < 50) return '#ffc107'; // Amarillo
        if (volume < 80) return '#fd7e14'; // Naranja
        return '#dc3545'; // Rojo
    };

    const handleStartBoth = async () => {
        await startListening();
        startAnalyzing();
    };

    const handleStopBoth = async () => {
        await stopListening();
        stopAnalyzing();
    };

    return (
        <div style={styles.container}>
            <h1>Ejemplo con Análisis de Audio</h1>
            
            {!isSupported && (
                <div style={styles.errorMessage}>
                    ⚠️ Tu navegador no soporta Speech Recognition
                </div>
            )}

            <div style={styles.audioSection}>
                <h3>🎵 Análisis de Audio en Tiempo Real</h3>
                <p>Volumen de entrada: {Math.round(volume)}%</p>
                
                <div style={styles.volumeMeter}>
                    <div 
                        style={{
                            ...styles.volumeBar,
                            width: `${volume}%`,
                            backgroundColor: getVolumeColor(volume)
                        }}
                    />
                </div>
                
                <div style={styles.volumeText}>
                    Estado del micrófono: {isAnalyzing ? '🎤 Activo' : '🔇 Inactivo'}
                </div>
            </div>
            
            <div style={{
                ...styles.status,
                ...(isListening ? styles.listening : styles.notListening)
            }}>
                Speech Recognition: {isListening ? '🎤 Escuchando...' : '⏸️ Detenido'}
            </div>

            <div>
                <button 
                    style={{...styles.button, ...styles.startButton}}
                    onClick={handleStartBoth}
                    disabled={!isSupported || isListening}
                >
                    ▶️ Iniciar Todo
                </button>
                
                <button 
                    style={{...styles.button, ...styles.stopButton}}
                    onClick={handleStopBoth}
                    disabled={!isSupported || !isListening}
                >
                    ⏹️ Detener Todo
                </button>
                
                <button 
                    style={{...styles.button, ...styles.clearButton}}
                    onClick={clearTranscript}
                    disabled={!isSupported}
                >
                    🗑️ Limpiar Texto
                </button>
            </div>

            <div style={styles.transcript}>
                <h3>Transcripción:</h3>
                <div>
                    <strong>Texto final:</strong>
                    <div style={{marginTop: '10px', lineHeight: '1.5'}}>
                        {transcript || <span style={styles.placeholder}>No hay texto final aún...</span>}
                    </div>
                </div>
                {interimTranscript && (
                    <div style={{marginTop: '15px'}}>
                        <strong>Texto temporal:</strong>
                        <div style={{...styles.interim, marginTop: '5px'}}>
                            {interimTranscript}
                        </div>
                    </div>
                )}
                {!transcript && !interimTranscript && (
                    <p style={styles.placeholder}>
                        Presiona "Iniciar Todo" para comenzar el reconocimiento de voz y análisis de audio...
                    </p>
                )}
            </div>

            <div style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
                <h4>Características del análisis de audio:</h4>
                <ul>
                    <li><strong>Medidor de volumen:</strong> Visualización en tiempo real del nivel de audio</li>
                    <li><strong>Detección de actividad:</strong> Indicador visual del estado del micrófono</li>
                    <li><strong>Integración completa:</strong> Combina análisis de audio con speech-to-text</li>
                    <li><strong>Retroalimentación visual:</strong> Colores que indican diferentes niveles de volumen</li>
                </ul>
                <p><strong>Tip:</strong> El medidor de volumen te ayuda a saber si tu micrófono está captando audio correctamente.</p>
            </div>
        </div>
    );
};

export default AudioAnalysisExample;
