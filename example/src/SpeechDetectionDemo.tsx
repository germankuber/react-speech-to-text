import React, { useState } from 'react';
import { useSpeechToText } from 'react-speech-to-text-gk';

const SpeechDetectionDemo: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [lightColor, setLightColor] = useState<'red' | 'green'>('red');

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10)); // Keep only last 10 logs
    };

    const { isListening, toggleListening } = useSpeechToText({
        onVoiceStart: (data) => {
            setLightColor('green');
            addLog('🟢 Voice START detected');
        },
        onVoiceStop: (data) => {
            setLightColor('red');
            addLog('🔴 Voice STOP detected');
        },
        onSpeechCompleted: (data) => {
            addLog('✅ Speech completed');
        }
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <h1 style={{ marginBottom: '30px', color: '#333' }}>
                🎤 Speech Detection Demo
            </h1>

            {/* Light indicator */}
            <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                backgroundColor: lightColor,
                border: '5px solid #333',
                boxShadow: `0 0 30px ${lightColor}`,
                marginBottom: '30px',
                transition: 'all 0.3s ease'
            }} />

            {/* Status text */}
            <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                {lightColor === 'green' ? '🗣️ SPEAKING' : '🤐 SILENT'}
            </p>

            {/* Control button */}
            <button
                onClick={toggleListening}
                style={{
                    padding: '15px 30px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    backgroundColor: isListening ? '#ff4444' : '#44ff44',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '30px'
                }}
            >
                {isListening ? '⏹️ Stop Listening' : '▶️ Start Listening'}
            </button>

            {/* Log section */}
            <div style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#000',
                color: '#00ff00',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px'
            }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>📋 Event Log:</h3>
                {logs.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>No events yet... Start listening and speak!</p>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} style={{ marginBottom: '5px' }}>
                            {log}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SpeechDetectionDemo;
