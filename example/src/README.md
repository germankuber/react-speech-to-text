# Ejemplos de React Speech to Text

Esta carpeta contiene ejemplos prácticos de cómo usar la librería React Speech to Text en diferentes escenarios.

## 🚀 Cómo ejecutar los ejemplos

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm start
```

3. Abre tu navegador en `http://localhost:3000`

## 📁 Estructura de ejemplos

### `src/BasicExample.tsx`
Ejemplo básico que muestra:
- Iniciar/detener reconocimiento de voz
- Mostrar transcripción en tiempo real
- Limpiar texto
- Indicador de estado de escucha

### `src/AdvancedExample.tsx`
Ejemplo avanzado con configuraciones:
- Selección de idioma
- Configuración de reconocimiento continuo
- Opciones de resultados temporales
- Interfaz de configuración dinámica

### `src/AudioAnalysisExample.tsx`
Ejemplo con análisis de audio que incluye:
- Medidor de volumen en tiempo real
- Detección de pitch (tono)
- Visualización del nivel de audio
- Integración completa con speech-to-text

### `src/DemoApp.tsx`
Aplicación principal que:
- Navegación entre ejemplos
- Interfaz unificada
- Documentación integrada

## 🔧 Características de los ejemplos

### Compatibilidad de navegadores
- ✅ Chrome/Chromium (recomendado)
- ✅ Edge
- ✅ Safari (limitado)
- ❌ Firefox (no soporta Web Speech API)

### Funcionalidades demostradas
- **Reconocimiento de voz básico**: Conversión de voz a texto
- **Múltiples idiomas**: Soporte para diferentes idiomas
- **Análisis de audio**: Medición de volumen y tono
- **Resultados temporales**: Visualización en tiempo real
- **Configuración dinámica**: Cambio de parámetros sin reiniciar

## 🎯 Casos de uso mostrados

1. **Asistente de voz simple**: Ejemplo básico para comandos simples
2. **Dictado multiidioma**: Transcripción en diferentes idiomas
3. **Monitor de audio**: Análisis de calidad y nivel de audio
4. **Aplicación completa**: Integración de todas las funcionalidades

## 🛠️ Personalización

Cada ejemplo puede ser personalizado modificando:

- **Idiomas soportados**: En `AdvancedExample.tsx`
- **Estilos visuales**: Objetos de estilo inline en cada componente
- **Configuración de audio**: Parámetros en `useAudioAnalysis`
- **Parámetros de reconocimiento**: Configuración en `useSpeechToText`

## 📋 Requisitos

- React 18+
- TypeScript 4.5+
- Navegador compatible con Web Speech API
- Permisos de micrófono habilitados

## 🔍 Solución de problemas

### "No se detecta micrófono"
- Verifica permisos de micrófono en el navegador
- Usa HTTPS en producción
- Comprueba que el micrófono esté conectado

### "Navegador no compatible"
- Usa Chrome, Edge o Safari
- Actualiza a la versión más reciente
- Firefox no soporta Web Speech API

### "No se escucha nada"
- Verifica el volumen del micrófono
- Habla más cerca del micrófono
- Revisa la configuración de audio del sistema

## 📚 Recursos adicionales

- [Documentación de Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Compatibilidad de navegadores](https://caniuse.com/speech-recognition)
- [Códigos de idioma BCP 47](https://tools.ietf.org/html/bcp47)

## 🤝 Contribuir

Para contribuir con nuevos ejemplos:

1. Crea un nuevo componente en `src/`
2. Sigue el patrón de los ejemplos existentes
3. Agrega documentación apropiada
4. Incluye el ejemplo en `DemoApp.tsx`
