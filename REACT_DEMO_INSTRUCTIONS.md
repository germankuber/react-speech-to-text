# 🚀 Demo HTML con React Real

## 📁 Archivos de demo disponibles:

### 1. `speech-detection-react-demo.html` - ✨ NUEVO React Real
- **🔥 Usa React real** desde CDN
- **⚡ Hook useSpeechToText real** (no simulado)
- **📊 Funcionalidad completa** con barra de countdown
- **🎯 Todo funciona tal como en el proyecto React**

### 2. `speech-detection-demo.html` - Simulación JavaScript
- Simulación de la funcionalidad sin React
- Mantiene la compatibilidad con navegadores antiguos

## 🚀 Cómo probar la demo React real:

### Paso 1: Asegurar que la librería esté compilada
```bash
npm run build
```

### Paso 2: Servir los archivos localmente
```bash
# Opción A: Usar Python
python -m http.server 8000

# Opción B: Usar Node.js (si tienes http-server)
npx http-server

# Opción C: Usar cualquier servidor local
```

### Paso 3: Abrir en navegador
```
http://localhost:8000/speech-detection-react-demo.html
```

## ✅ Características del React Demo:

### 🔧 Tecnologías usadas:
- **React 18** desde CDN
- **Babel Standalone** para transformar JSX
- **Pitchy** para detección de pitch
- **UMD build** de nuestra librería

### 🎯 Hook real sin modificaciones:
```jsx
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
    silenceTimeout: 3000,
    onSpeechStart: (data) => {
        // Funcionalidad real
    },
    onSpeechEnd: (data) => {
        // Funcionalidad real
    },
    onSilenceDetected: (data) => {
        // Funcionalidad real
    }
});
```

### 📊 Funcionalidades incluidas:

#### ✨ Barra de countdown siempre visible:
- **🔄 ESPERANDO** (gris) - Cuando no hay actividad
- **🎤 HABLANDO** (azul) - Cuando estás hablando  
- **⏱️ COUNTDOWN** (verde→amarillo→rojo) - Conteo regresivo de 3s

#### 🎛️ Controles configurables:
- **Umbral de volumen** (5-50%)
- **Pausa para fin** (100-1000ms)
- **Logging en consola** (opcional)

#### 📈 Métricas en tiempo real:
- Segmentos de habla
- Tiempo hablando/silencio
- Volumen, pitch, centroide espectral

#### 📅 Timeline de eventos:
- Eventos de inicio/fin de habla
- Detección de silencio
- Timestamps precisos

## 🛠️ Troubleshooting:

### Error: "No se pudo cargar la librería"
- ✅ Verifica que `dist/index.umd.js` existe
- ✅ Ejecuta `npm run build` primero
- ✅ Sirve desde un servidor HTTP (no file://)

### Error: "useSpeechToText is not defined"  
- ✅ Verifica que todos los scripts estén cargando
- ✅ Abre DevTools → Console para ver errores
- ✅ Verifica la conexión a internet (CDNs)

### Error: "No soporta Speech Recognition"
- ✅ Usa Chrome, Edge o Safari
- ✅ Permite acceso al micrófono
- ✅ Usa HTTPS o localhost

## 🔄 Diferencias con las demos:

| Característica | React Demo | JS Demo | Proyecto React |
|----------------|------------|---------|----------------|
| **Hook real** | ✅ Sí | ❌ Simulado | ✅ Sí |
| **Estado React** | ✅ useState | ❌ Variables | ✅ useState |
| **Callbacks reales** | ✅ Sí | ❌ Simulados | ✅ Sí |
| **Análisis de audio** | ✅ Pitchy | ❌ Simulado | ✅ Pitchy |
| **Funcionalidad** | 🔥 100% | ⚡ ~90% | 🔥 100% |

## 🎉 Ventajas del React Demo:

1. **🔥 Funcionalidad idéntica** al proyecto React
2. **📁 Un solo archivo** HTML autocontenido  
3. **🚀 Fácil de compartir** y demo
4. **🛠️ Sin build process** para modificaciones
5. **📊 Testing real** de la librería UMD
6. **🎯 Perfecta demostración** de las capacidades

¡Ahora puedes demostrar todas las funcionalidades usando React real en un simple archivo HTML! 🎯