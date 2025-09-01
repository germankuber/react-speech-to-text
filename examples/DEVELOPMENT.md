# Development Guide - React Speech-to-Text Examples

Este documento describe cómo trabajar con los ejemplos en modo desarrollo usando el código fuente local.

## 🔧 Arquitectura de Desarrollo

### Configuración Local
Los ejemplos están configurados para usar **directamente el código fuente** del paquete principal sin necesidad de builds intermedios:

```
speech_to_text/
├── src/                          # Código fuente del paquete
│   ├── lib/index.ts             # Export principal
│   ├── hooks/
│   ├── types/
│   └── utils/
├── examples/                     # Ejemplos de uso
│   ├── src/
│   └── vite.config.ts           # Alias: 'react-speech-to-text-gk' → '../src/lib/index.ts'
└── package.json                 # Workspace configurado
```

### Flujo de Desarrollo

1. **Cambios en `/src`** se reflejan automáticamente en examples
2. **Hot Module Replacement** funciona entre paquete y ejemplos
3. **TypeScript intellisense** completo en VSCode
4. **No necesitas rebuilds** del paquete principal

## 🚀 Comandos de Desarrollo

### Desde el directorio raíz:
```bash
# Instalar todas las dependencias (workspace)
npm install

# Instalar dependencias de examples
npm run example:install

# Ejecutar servidor de desarrollo
npm run example:start
# o
npm run example:dev

# Build de producción de examples
npm run example:build

# Build del paquete principal
npm run build
```

### Desde `/examples`:
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Type checking
npm run type-check
```

## 🔍 Debugging y Desarrollo

### Hot Module Replacement
- Cambios en `/src/**/*.ts` → Auto-reload en examples
- Cambios en `/examples/src/**/*.tsx` → Hot reload
- Cambios en types → IntelliSense actualizado automáticamente

### Estructura de Imports
```typescript
// En los ejemplos puedes importar directamente:
import { useSpeechToText, PerformanceMode } from 'react-speech-to-text-gk'

// Vite resuelve automáticamente a:
import { ... } from '../src/lib/index.ts'
```

### Configuración de Vite
```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      'react-speech-to-text-gk': '../src/lib/index.ts'
    }
  }
})
```

## 🛠️ Solución de Problemas

### Error: "Cannot resolve module"
```bash
# Reinstalar dependencias
npm run example:install

# Verificar que existe el archivo principal
ls -la ../src/lib/index.ts
```

### Error de TypeScript
```bash
# Type checking desde examples
npm run type-check

# Verificar configuración de paths en tsconfig.json
```

### Error: "WebSocket connection failed"
- Verifica que no hay conflictos de puerto (3001)
- Reinicia el servidor de desarrollo

### Error de permisos de micrófono
- Los ejemplos requieren HTTPS en algunos navegadores
- Chrome permite localhost sin HTTPS
- Para producción, usa HTTPS

## 📦 Build y Distribución

### Para desarrollo:
```bash
npm run example:dev  # Servidor de desarrollo con HMR
```

### Para testing:
```bash
npm run example:build  # Build optimizado
npm run example:preview  # Servidor local del build
```

### Para CI/CD:
```bash
npm run build          # Build del paquete principal
npm run test:ci        # Tests completos
npm run example:build  # Build de ejemplos
```

## 🎯 Casos de Uso de Desarrollo

### 1. Agregar Nueva Funcionalidad
1. Modifica `/src/hooks/` o `/src/utils/`
2. Actualiza `/src/types/` si es necesario
3. Exporta en `/src/lib/index.ts`
4. Crea ejemplo en `/examples/src/examples/`
5. Los cambios se ven inmediatamente

### 2. Debug de Problemas
1. Abre DevTools en el ejemplo
2. Coloca breakpoints en el código fuente
3. Los source maps apuntan al código TypeScript original
4. Stack traces muestran ubicaciones reales

### 3. Testing de Nueva API
1. Crea componente de prueba en examples
2. Importa directamente desde el paquete
3. Iteración rápida sin rebuilds

## 🔄 Workflow Recomendado

```bash
# Terminal 1: Desarrollo de examples
npm run example:dev

# Terminal 2: Tests en watch mode
npm run test:watch

# Terminal 3: Build checks
npm run build && npm run example:build
```

## 📝 Notas Importantes

- **Workspaces**: Los ejemplos están en un workspace de npm
- **Symlink virtual**: Vite crea un symlink virtual, no físico
- **Performance**: El HMR es muy rápido porque no hay transpilación extra
- **Types**: IntelliSense funciona perfectamente con esta configuración
- **Production builds**: Los examples buildean correctamente para distribución