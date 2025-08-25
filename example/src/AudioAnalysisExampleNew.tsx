import React, { useState, useEffect } from 'react';
import { useSpeechToText } from '../../src/hooks/useSpeechToText';
import { useAudioAnalysis } from '../../src/hooks/useAudioAnalysis';
import { PerformanceMode } from '../../src/types/speechToText';

const AudioAnalysisExample: React.FC = () => {
    const [language, setLanguage] = useState('es-ES');
    const [isRecording, setIsRecording] = useState(false);
    
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
        language,
        silenceTimeout: 1000,
        optimizedMode: true,
        performanceMode: PerformanceMode.BALANCED
    });

    const {
        initializeAudioAnalysis,
        stopAudioAnalysis,
        getAudioData
    } = useAudioAnalysis(PerformanceMode.BALANCED);

    const [currentAudioData, setCurrentAudioData] = useState(getAudioData());

    // Actualizar datos de audio cada 100ms cuando esté grabando
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setCurrentAudioData(getAudioData());
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording, getAudioData]);

    const languages = [
        { code: 'es-ES', name: 'Español (España)' },
        { code: 'en-US', name: 'English (US)' },
        { code: 'fr-FR', name: 'Français' },
        { code: 'de-DE', name: 'Deutsch' }
    ];

    const handleStart = async () => {
        try {
            await initializeAudioAnalysis();
            setIsRecording(true);
            await startListening();
        } catch (error) {
            console.error('Error al iniciar:', error);
        }
    };

    const handleStop = async () => {
        try {
            stopAudioAnalysis();
            setIsRecording(false);
            await stopListening();
        } catch (error) {
            console.error('Error al detener:', error);
        }
    };

    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1000px',
            margin: '30px auto',
            padding: '20px'
        },
        header: {
            textAlign: 'center' as const,
            marginBottom: '30px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
        },
        panel: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
        },
        controls: {
            textAlign: 'center' as const,
            marginBottom: '20px'
        },
        button: {
            padding: '12px 24px',
            margin: '8px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold' as const
        },
        startBtn: {
            backgroundColor: '#28a745',
            color: 'white'
        },
        stopBtn: {
            backgroundColor: '#dc3545',
            color: 'white'
        },
        clearBtn: {
            backgroundColor: '#007bff',
            color: 'white'
        },
        select: {
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginLeft: '10px'
        },
        volumeMeter: {
            width: '100%',
            height: '20px',
            backgroundColor: '#e9ecef',
            borderRadius: '10px',
            overflow: 'hidden',
            margin: '10px 0'
        },
        volumeBar: {
            height: '100%',
            backgroundColor: '#28a745',
            transition: 'width 0.1s ease'
        },
        frequencyDisplay: {
            fontSize: '24px',
            fontWeight: 'bold' as const,
            textAlign: 'center' as const,
            color: '#495057',
            margin: '10px 0'
        },
        status: {
            padding: '15px',
            borderRadius: '6px',
            margin: '15px 0',
            fontSize: '18px',
            fontWeight: 'bold' as const,
            textAlign: 'center' as const
        },
        listening: {
            backgroundColor: '#d1ecf1',
            color: '#0c5460',
            border: '1px solid #bee5eb'
        },
        notListening: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb'
        },
        transcript: {
            gridColumn: '1 / -1',
            border: '2px solid #ddd',
            padding: '20px',
            minHeight: '150px',
            backgroundColor: '#fff',
            borderRadius: '8px'
        },
        errorMessage: {
            color: '#721c24',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center' as const
        }
    };

    const volumePercentage = currentAudioData.currentVolume; // Ya está en escala 0-100
    const pitch = currentAudioData.currentPitch;
    const spectralCentroid = currentAudioData.currentSpectralCentroid;
    const isActive = isListening && isRecording;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>🎤 Ejemplo con Análisis de Audio</h1>
                <p>Reconocimiento de voz con análisis en tiempo real de volumen y frecuencia</p>
            </div>
            
            {!isSupported && (
                <div style={styles.errorMessage}>
                    ⚠️ Tu navegador no soporta Speech Recognition o Web Audio API
                </div>
            )}

            <div style={styles.controls}>
                <label>
                    Idioma:
                    <select 
                        style={styles.select}
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isActive}
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div style={{
                ...styles.status,
                ...(isActive ? styles.listening : styles.notListening)
            }}>
                {isActive ? '🎤 Grabando y Analizando...' : '⏸️ Detenido'}
            </div>

            <div style={styles.controls}>
                <button 
                    style={{
                        ...styles.button,
                        ...styles.startBtn,
                        opacity: (!isSupported || isActive) ? 0.5 : 1
                    }}
                    onClick={handleStart}
                    disabled={!isSupported || isActive}
                >
                    🎙️ Iniciar Grabación y Análisis
                </button>
                
                <button 
                    style={{
                        ...styles.button,
                        ...styles.stopBtn,
                        opacity: (!isSupported || !isActive) ? 0.5 : 1
                    }}
                    onClick={handleStop}
                    disabled={!isSupported || !isActive}
                >
                    🛑 Detener
                </button>
                
                <button 
                    style={{
                        ...styles.button,
                        ...styles.clearBtn,
                        opacity: !isSupported ? 0.5 : 1
                    }}
                    onClick={clearTranscript}
                    disabled={!isSupported}
                >
                    🗑️ Limpiar
                </button>
            </div>

            <div style={styles.grid}>
                <div style={styles.panel}>
                    <h3>📊 Análisis de Audio</h3>
                    
                    <div>
                        <strong>Volumen:</strong>
                        <div style={styles.volumeMeter}>
                            <div 
                                style={{
                                    ...styles.volumeBar,
                                    width: `${volumePercentage}%`,
                                    backgroundColor: volumePercentage > 80 ? '#dc3545' : 
                                                   volumePercentage > 50 ? '#ffc107' : '#28a745'
                                }}
                            />
                        </div>
                        <small>{volumePercentage.toFixed(1)}%</small>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <strong>Frecuencia Dominante:</strong>
                        <div style={styles.frequencyDisplay}>
                            {pitch ? `${pitch.toFixed(0)} Hz` : '-- Hz'}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                        <p><strong>Estado del micrófono:</strong> {isRecording ? '🔴 Activo' : '⚫ Inactivo'}</p>
                        <p><strong>Reconocimiento:</strong> {isListening ? '🟢 Activo' : '🔴 Inactivo'}</p>
                    </div>
                </div>

                <div style={styles.panel}>
                    <h3>🎯 Indicadores de Calidad</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Calidad de Señal:</strong>
                        <div style={{
                            padding: '10px',
                            borderRadius: '4px',
                            marginTop: '5px',
                            backgroundColor: volumePercentage > 20 && volumePercentage < 80 ? '#d4edda' : '#f8d7da',
                            color: volumePercentage > 20 && volumePercentage < 80 ? '#155724' : '#721c24'
                        }}>
                            {volumePercentage < 20 ? '🔇 Muy bajo' :
                             volumePercentage > 80 ? '📢 Muy alto' : '✅ Óptimo'}
                        </div>
                    </div>

                    <div>
                        <strong>Rango de Frecuencia:</strong>
                        <div style={{
                            padding: '10px',
                            borderRadius: '4px',
                            marginTop: '5px',
                            backgroundColor: pitch && pitch > 80 && pitch < 1000 ? '#d4edda' : '#fff3cd',
                            color: pitch && pitch > 80 && pitch < 1000 ? '#155724' : '#856404'
                        }}>
                            {!pitch ? '⏳ Sin datos' :
                             pitch < 80 ? '📉 Muy grave' :
                             pitch > 1000 ? '📈 Muy agudo' : '🎵 Rango vocal'}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                        <h4>💡 Consejos:</h4>
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            <li>Mantén el volumen en el rango verde</li>
                            <li>Habla con claridad y a velocidad normal</li>
                            <li>Evita ruidos de fondo</li>
                        </ul>
                    </div>
                </div>

                <div style={styles.transcript}>
                    <h3>📝 Transcripción:</h3>
                    
                    {transcript && (
                        <div style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                            <strong>Texto confirmado:</strong><br />
                            {transcript}
                        </div>
                    )}
                    
                    {interimTranscript && (
                        <div style={{ color: '#666', fontStyle: 'italic', lineHeight: '1.6' }}>
                            <strong>Reconociendo:</strong> {interimTranscript}
                        </div>
                    )}
                    
                    {!transcript && !interimTranscript && (
                        <div style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
                            🎙️ Presiona "Iniciar Grabación y Análisis" para comenzar<br />
                            Verás el análisis de audio en tiempo real mientras hablas
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '30px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                <h4>🚀 Características de este ejemplo:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    <div>📊 Análisis de volumen en tiempo real</div>
                    <div>🎵 Detección de frecuencia dominante</div>
                    <div>🎯 Indicadores de calidad de audio</div>
                    <div>🔄 Sincronización de audio y reconocimiento</div>
                </div>
            </div>
        </div>
    );
};

export default AudioAnalysisExample;
