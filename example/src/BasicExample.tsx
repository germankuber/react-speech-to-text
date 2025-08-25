import React from 'react';
import { useSpeechToText } from 'react-speech-to-text-gk';

const BasicExample: React.FC = () => {
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
        startBtn: {
            backgroundColor: '#4CAF50',
            color: 'white'
        },
        stopBtn: {
            backgroundColor: '#f44336',
            color: 'white'
        },
        clearBtn: {
            backgroundColor: '#008CBA',
            color: 'white'
        },
        transcript: {
            border: '1px solid #ddd',
            padding: '15px',
            margin: '20px 0',
            minHeight: '100px',
            backgroundColor: '#f9f9f9'
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
            backgroundColor: '#fee'
        },
        interim: {
            color: '#666'
        },
        placeholder: {
            color: '#999'
        },
        instructions: {
            marginTop: '20px',
            fontSize: '14px',
            color: '#666'
        }
    };

    return (
        <div style={styles.container}>
            <h1>Ejemplo Básico - Speech to Text</h1>
            
            {!isSupported && (
                <div style={styles.errorMessage}>
                    ⚠️ Tu navegador no soporta Speech Recognition
                </div>
            )}
            
            <div style={{
                ...styles.status,
                ...(isListening ? styles.listening : styles.notListening)
            }}>
                Estado: {isListening ? '🎤 Escuchando...' : '⏸️ Detenido'}
            </div>

            <div>
                <button 
                    style={{
                        ...styles.button,
                        ...styles.startBtn,
                        opacity: (!isSupported || isListening) ? 0.5 : 1
                    }}
                    onClick={startListening}
                    disabled={!isSupported || isListening}
                >
                    ▶️ Iniciar Grabación
                </button>
                
                <button 
                    style={{
                        ...styles.button,
                        ...styles.stopBtn,
                        opacity: (!isSupported || !isListening) ? 0.5 : 1
                    }}
                    onClick={stopListening}
                    disabled={!isSupported || !isListening}
                >
                    ⏹️ Detener Grabación
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
                    🗑️ Limpiar Texto
                </button>
            </div>

            <div style={styles.transcript}>
                <h3>Transcripción:</h3>
                <p><strong>Texto final:</strong> {transcript}</p>
                {interimTranscript && (
                    <p><strong>Texto temporal:</strong> <em style={styles.interim}>{interimTranscript}</em></p>
                )}
                {!transcript && !interimTranscript && (
                    <p style={styles.placeholder}>Presiona "Iniciar Grabación" y comienza a hablar...</p>
                )}
            </div>

            <div style={styles.instructions}>
                <h4>Instrucciones:</h4>
                <ul>
                    <li>Usa <strong>startListening()</strong> para comenzar la grabación</li>
                    <li>Usa <strong>stopListening()</strong> para detener la grabación</li>
                    <li>El texto aparece en tiempo real mientras hablas</li>
                    <li>Funciona mejor en Chrome/Edge</li>
                </ul>
            </div>
        </div>
    );
};

export default BasicExample;
