import React, { useState } from 'react';
import BasicExample from './BasicExample';
import AdvancedExample from './AdvancedExample';
import AudioAnalysisExample from './AudioAnalysisExample';

type ExampleType = 'basic' | 'advanced' | 'audio';

const App: React.FC = () => {
    const [currentExample, setCurrentExample] = useState<ExampleType>('basic');

    const examples = [
        { id: 'basic' as const, name: '🎯 Ejemplo Básico', description: 'Funcionalidad esencial de speech-to-text' },
        { id: 'advanced' as const, name: '⚙️ Ejemplo Avanzado', description: 'Configuración de idiomas y opciones' },
        { id: 'audio' as const, name: '📊 Análisis de Audio', description: 'Métricas de audio en tiempo real' }
    ];

    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif'
        },
        header: {
            backgroundColor: '#282c34',
            color: 'white',
            padding: '20px',
            textAlign: 'center' as const
        },
        nav: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderBottom: '1px solid #dee2e6'
        },
        navGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        navItem: {
            padding: '15px',
            border: '2px solid transparent',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: 'white'
        },
        navItemActive: {
            borderColor: '#007bff',
            backgroundColor: '#e7f3ff'
        },
        navTitle: {
            fontSize: '18px',
            fontWeight: 'bold' as const,
            marginBottom: '5px'
        },
        navDescription: {
            fontSize: '14px',
            color: '#666'
        },
        content: {
            minHeight: '80vh'
        },
        footer: {
            backgroundColor: '#f8f9fa',
            padding: '20px',
            textAlign: 'center' as const,
            borderTop: '1px solid #dee2e6',
            color: '#666'
        }
    };

    const renderExample = () => {
        switch (currentExample) {
            case 'basic':
                return <BasicExample />;
            case 'advanced':
                return <AdvancedExample />;
            case 'audio':
                return <AudioAnalysisExample />;
            default:
                return <BasicExample />;
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>🎤 React Speech to Text - Ejemplos</h1>
                <p>Explora diferentes formas de usar la librería de reconocimiento de voz</p>
            </header>

            <nav style={styles.nav}>
                <div style={styles.navGrid}>
                    {examples.map((example) => (
                        <div
                            key={example.id}
                            style={{
                                ...styles.navItem,
                                ...(currentExample === example.id ? styles.navItemActive : {})
                            }}
                            onClick={() => setCurrentExample(example.id)}
                            onMouseEnter={(e) => {
                                if (currentExample !== example.id) {
                                    e.currentTarget.style.borderColor = '#6c757d';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentExample !== example.id) {
                                    e.currentTarget.style.borderColor = 'transparent';
                                }
                            }}
                        >
                            <div style={styles.navTitle}>{example.name}</div>
                            <div style={styles.navDescription}>{example.description}</div>
                        </div>
                    ))}
                </div>
            </nav>

            <main style={styles.content}>
                {renderExample()}
            </main>

            <footer style={styles.footer}>
                <p>
                    💡 <strong>Tip:</strong> Para mejor rendimiento usa Chrome o Edge. 
                    En Firefox algunas funciones pueden estar limitadas.
                </p>
                <p>
                    🔧 <strong>Desarrollo:</strong> Esta demostración muestra las capacidades de la librería react-speech-to-text
                </p>
            </footer>
        </div>
    );
};

export default App;
