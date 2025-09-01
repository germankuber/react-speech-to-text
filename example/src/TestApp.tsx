import React from 'react';

const TestApp: React.FC = () => {
    console.log('TestApp: Renderizando componente de prueba');
    
    return (
        <div style={{
            background: 'red',
            color: 'white',
            padding: '20px',
            fontSize: '24px',
            textAlign: 'center'
        }}>
            <h1>🎤 TEST - Si ves esto, React funciona!</h1>
            <p>Componente de prueba renderizado correctamente</p>
        </div>
    );
};

export default TestApp;
