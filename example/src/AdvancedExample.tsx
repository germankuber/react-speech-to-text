import React, { useState } from 'react';
import { useSpeechToText } from 'react-speech-to-text-gk';

const AdvancedExample: React.FC = () => {
    const [language, setLanguage] = useState('es-ES');
    const [silenceTimeout, setSilenceTimeout] = useState(700);
    const [optimizedMode, setOptimizedMode] = useState(true);

    const {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        silenceDetected,
        sessionMetadata,
        audioMetrics,
        startListening,
        stopListening,
        clearTranscript
    } = useSpeechToText({
        language,
        silenceTimeout,
        optimizedMode
    });

    const languages = [
        { code: 'es-ES', name: 'Español (España)' },
        { code: 'es-MX', name: 'Español (México)' },
        { code: 'en-US', name: 'English (US)' },
        { code: 'en-GB', name: 'English (UK)' },
        { code: 'fr-FR', name: 'Français' },
        { code: 'de-DE', name: 'Deutsch' },
        { code: 'it-IT', name: 'Italiano' },
        { code: 'pt-BR', name: 'Português (Brasil)' }
    ];

    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '900px',
            margin: '50px auto',
            padding: '20px'
        },
        configSection: {
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
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
        select: {
            padding: '8px',
            margin: '5px',
            borderRadius: '4px',
            border: '1px solid #ddd'
        },
        checkbox: {
            margin: '10px 5px'
        },
        transcript: {
            border: '1px solid #ddd',
            padding: '15px',
            margin: '20px 0',
            minHeight: '120px',
            backgroundColor: '#f9f9f9',
            borderRadius: '5px'
        },
        status: {
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0',
            fontWeight: 'bold'
        },
        listening: {
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724'
        },
        notListening: {
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24'
        },
        errorMessage: {
            color: 'red',
            padding: '10px',
            backgroundColor: '#fee',
            borderRadius: '5px',
            marginBottom: '10px'
        },
        interim: {
            color: '#666',
            fontStyle: 'italic'
        },
        placeholder: {
            color: '#999'
        },
        configItem: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold'
        }
    };

    return (
        <div style={styles.container}>
            <h1>Ejemplo Avanzado - Speech to Text</h1>
            
            {!isSupported && (
                <div style={styles.errorMessage}>
                    ⚠️ Tu navegador no soporta Speech Recognition
                </div>
            )}

            <div style={styles.configSection}>
                <h3>Configuración</h3>
                
                <div style={styles.configItem}>
                    <label style={styles.label} htmlFor="language-select">
                        Idioma:
                    </label>
                    <select
                        id="language-select"
                        style={styles.select}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isListening}
                    >
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.configItem}>
                    <label style={styles.label} htmlFor="silence-timeout">
                        Timeout de silencio (ms):
                    </label>
                    <input
                        id="silence-timeout"
                        type="number"
                        style={styles.select}
                        value={silenceTimeout}
                        onChange={(e) => setSilenceTimeout(Number(e.target.value))}
                        disabled={isListening}
                        min="100"
                        max="5000"
                        step="100"
                    />
                </div>

                <div style={styles.configItem}>
                    <label>
                        <input
                            type="checkbox"
                            style={styles.checkbox}
                            checked={optimizedMode}
                            onChange={(e) => setOptimizedMode(e.target.checked)}
                            disabled={isListening}
                        />
                        Modo optimizado (más rápido)
                    </label>
                </div>
            </div>
            
            <div style={{
                ...styles.status,
                ...(isListening ? styles.listening : styles.notListening)
            }}>
                Estado: {isListening ? '🎤 Escuchando...' : '⏸️ Detenido'}
                {isListening && (
                    <span> | Idioma: {languages.find(l => l.code === language)?.name}</span>
                )}
                {silenceDetected && (
                    <span> | 🔇 Silencio detectado</span>
                )}
            </div>

            {sessionMetadata && (
                <div style={{...styles.configSection, backgroundColor: '#e8f5e8'}}>
                    <h4>📊 Métricas de la sesión:</h4>
                    <p><strong>Palabras totales:</strong> {sessionMetadata.words.length}</p>
                    <p><strong>Duración:</strong> {Math.round(sessionMetadata.totalDuration / 1000)}s</p>
                    <p><strong>Volumen promedio:</strong> {sessionMetadata.overallAverageVolume.toFixed(1)} dB</p>
                    <p><strong>Volumen pico:</strong> {sessionMetadata.overallPeakVolume.toFixed(1)} dB</p>
                </div>
            )}

            <div>
                <button 
                    style={{...styles.button, ...styles.startButton}}
                    onClick={startListening}
                    disabled={!isSupported || isListening}
                >
                    ▶️ Iniciar Grabación
                </button>
                
                <button 
                    style={{...styles.button, ...styles.stopButton}}
                    onClick={stopListening}
                    disabled={!isSupported || !isListening}
                >
                    ⏹️ Detener Grabación
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
                        Configura las opciones arriba y presiona "Iniciar Grabación" para comenzar...
                    </p>
                )}
            </div>

            <div style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
                <h4>Características del ejemplo avanzado:</h4>
                <ul>
                    <li><strong>Múltiples idiomas:</strong> Soporte para varios idiomas</li>
                    <li><strong>Timeout de silencio:</strong> Configurar cuándo detener por silencio</li>
                    <li><strong>Modo optimizado:</strong> Balance entre velocidad y precisión</li>
                    <li><strong>Métricas en tiempo real:</strong> Análisis de audio y sesión</li>
                    <li><strong>Detección de silencio:</strong> Indicador visual de actividad</li>
                </ul>
            </div>
        </div>
    );
};

export default AdvancedExample;
