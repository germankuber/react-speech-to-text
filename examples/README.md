# React Speech-to-Text Examples

Este directorio contiene ejemplos completos de uso de la librería `react-speech-to-text-gk`.

## 🚀 Inicio Rápido

### Desde el directorio raíz del proyecto:

```bash
# Instalar dependencias de los ejemplos
npm run example:install

# Ejecutar los ejemplos en modo desarrollo
npm run example:dev
```

### Desde este directorio:

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la construcción
npm run preview
```

## 📚 Ejemplos Disponibles

### 1. 🎤 Ejemplo Básico
- Reconocimiento de voz simple
- Configuración mínima
- Perfecto para empezar

### 2. 📊 Métricas de Audio
- Análisis en tiempo real
- Visualización de volumen y tono
- Métricas detalladas

### 3. 📝 Herramienta de Transcripción
- Transcripción de alta calidad
- Estadísticas de sesión completas
- Exportación de datos
- Análisis de palabras por minuto

### 4. 🗣️ Controles por Voz
- Comandos interactivos
- Control de interfaz mediante voz
- Historial de comandos
- Demostración de casos de uso prácticos

### 5. 🔊 Análisis de Audio Puro
- Solo análisis de audio (sin reconocimiento)
- Visualizaciones avanzadas
- Estadísticas técnicas detalladas
- Configuración de alta calidad

## 🛠️ Configuración Técnica

### Desarrollo Local
Los ejemplos están configurados para usar el código fuente local del paquete mediante:
- Alias en Vite que apunta a `../src/lib/index.ts`
- Dependencia local en package.json: `"react-speech-to-text-gk": "file:.."`
- Configuración de TypeScript con paths para resolución de módulos

### Stack Tecnológico
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **CSS3** - Estilos con variables CSS y grid/flexbox

## 🎯 Propósito

Estos ejemplos están diseñados para:

1. **Desarrolladores**: Ver implementaciones reales y completas
2. **Evaluación**: Probar todas las características antes de adoptar la librería
3. **Referencia**: Copiar y adaptar patrones de código
4. **Demos**: Mostrar capacidades en presentaciones

## 📝 Notas Importantes

- **Permisos de micrófono**: Los ejemplos requieren acceso al micrófono
- **Compatibilidad**: Funcionan mejor en Chrome, Safari y Edge
- **HTTPS**: Algunos ejemplos requieren HTTPS en producción
- **Desarrollo**: El servidor de desarrollo se ejecuta en puerto 3001

## 🔧 Personalización

Puedes modificar cualquier ejemplo para experimentar con:
- Diferentes idiomas de reconocimiento
- Modos de rendimiento (SPEED/BALANCED/QUALITY)
- Configuraciones de audio
- Timeouts de silencio
- Estilos y UI

## 📞 Soporte

Si encuentras problemas con los ejemplos:
1. Verifica que tu navegador soporte Web Speech API
2. Asegúrate de haber concedido permisos de micrófono
3. Revisa la consola del navegador para errores
4. Consulta la documentación principal del proyecto