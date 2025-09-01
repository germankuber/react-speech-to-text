import React, { useState } from 'react';
import BasicExample from './BasicExample';
import AdvancedExample from './AdvancedExample';
import AudioAnalysisExample from './AudioAnalysisExample';
import SpeechDetectionExample from './SpeechDetectionExample';

type ExampleType = 'basic' | 'advanced' | 'audio' | 'detection';

const DemoApp: React.FC = () => {
    const [currentExample, setCurrentExample] = useState<ExampleType>('detection');

    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        },
        header: {
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
            textAlign: 'center' as const
        },
        navigation: {
            backgroundColor: '#34495e',
            padding: '15px',
            display: 'flex',
            justifyContent: 'center',
            gap: '10px'
        },
        navButton: {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
        },
        activeButton: {
            backgroundColor: '#3498db',
            color: 'white'
        },
        inactiveButton: {
            backgroundColor: '#ecf0f1',
            color: '#2c3e50'
        },
        content: {
            padding: '0'
        },
        footer: {
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
            textAlign: 'center' as const,
            marginTop: '50px'
        }
    };

    const examples = [
        { id: 'basic' as ExampleType, title: 'Básico', description: 'Ejemplo simple de Speech to Text' },
        { id: 'advanced' as ExampleType, title: 'Avanzado', description: 'Configuración avanzada con múltiples opciones' },
        { id: 'audio' as ExampleType, title: 'Análisis de Audio', description: 'Análisis de audio en tiempo real' },
        { id: 'detection' as ExampleType, title: '🆕 Detección de Habla', description: 'Detección de inicio y fin de habla en tiempo real' }
    ];

    const renderExample = () => {
        switch (currentExample) {
            case 'basic':
                return <BasicExample />;
            case 'advanced':
                return <AdvancedExample />;
            case 'audio':
                return <AudioAnalysisExample />;
            case 'detection':
                return <SpeechDetectionExample />;
            default:
                return <BasicExample />;
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>🎤 React Speech to Text - Demos</h1>
                <p>Ejemplos de uso de la librería de reconocimiento de voz</p>
                <div style={{
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    marginTop: '15px',
                    border: '2px solid #ffc107'
                }}>
                    <strong>🆕 NUEVA FUNCIONALIDAD:</strong> Detección de inicio y fin de habla en tiempo real
                </div>
            </header>

            <nav style={styles.navigation}>
                {examples.map((example) => (
                    <button
                        key={example.id}
                        style={{
                            ...styles.navButton,
                            ...(currentExample === example.id ? styles.activeButton : styles.inactiveButton)
                        }}
                        onClick={() => setCurrentExample(example.id)}
                        title={example.description}
                    >
                        {example.title}
                    </button>
                ))}
            </nav>

            <main style={styles.content}>
                {renderExample()}
            </main>

            <footer style={styles.footer}>
                <p>
                    <strong>React Speech to Text Library</strong> - 
                    Ejemplos de implementación con diferentes configuraciones
                </p>
                <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                    Funciona mejor en navegadores basados en Chromium (Chrome, Edge, etc.)
                </p>
            </footer>
        </div>
    );
};

export default DemoApp;
