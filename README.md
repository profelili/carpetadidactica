# 📚 Carpeta Didáctica

Aplicación web para gestionar carpetas didácticas de alumnos con sincronización en la nube mediante Supabase.

## ✨ Características

- ✅ Gestión de alumnos con categorías (domiciliarios, hospitalarios, hogares, otros)
- ✅ Planificador de actividades con calendario
- ✅ Sincronización automática con Supabase
- ✅ Respaldo automático en localStorage
- ✅ Exportación a documentos Word (.doc)
- ✅ Interfaz moderna y responsiva
- ✅ Manejo robusto de errores

## 🚀 Despliegue en Vercel

### Opción 1: Conectar con GitHub (Recomendado)

1. Subí este proyecto a tu repositorio de GitHub
2. Andá a [Vercel](https://vercel.com)
3. Conectá tu cuenta de GitHub
4. Seleccioná el repositorio
5. Vercel detectará automáticamente la configuración y desplegará

### Opción 2: Despliegue manual

1. Descargá el proyecto
2. Ejecutá `npm install`
3. Ejecutá `npm run build`
4. Subí la carpeta `dist` a Vercel

## 🗄️ Configuración de Supabase

La aplicación usa Supabase para sincronizar datos en la nube.

### 1. Crear proyecto en Supabase

1. Andá a [Supabase](https://supabase.com)
2. Creá un nuevo proyecto
3. Copiá la URL y la clave anon

### 2. Configurar credenciales

Editá `src/supabaseClient.ts` y reemplazá:

```typescript
const supabaseUrl = 'TU_URL_AQUI';
const supabaseAnonKey = 'TU_CLAVE_AQUI';
```

### 3. Crear tablas en Supabase

Andá al SQL Editor de Supabase y ejecutá:

```sql
-- Tabla de alumnos
CREATE TABLE alumnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('domiciliarios', 'hospitalarios', 'hogares', 'otros')),
  escuela_origen TEXT NOT NULL,
  grado TEXT NOT NULL,
  establecimiento TEXT NOT NULL,
  tutor TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'egresado')),
  fecha_alta DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnostico TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('domiciliarios', 'hospitalarios', 'hogares', 'otros')),
  alumno_ids UUID[] DEFAULT '{}',
  area TEXT NOT NULL,
  duracion TEXT,
  objetivo TEXT,
  consignas TEXT NOT NULL,
  recursos TEXT,
  realizada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permitir todo por ahora)
CREATE POLICY "Permitir todo para alumnos" ON alumnos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo para actividades" ON actividades FOR ALL USING (true) WITH CHECK (true);
```

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Verificar tipos
npm run typecheck
```

## 📦 Estructura del proyecto

```
carpetadidactica/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard.tsx    # Panel principal
│   │   ├── Planner.tsx      # Planificador
│   │   ├── Sidebar.tsx      # Barra lateral
│   │   ├── Students.tsx     # Gestión de alumnos
│   │   └── ui.tsx           # Componentes UI reutilizables
│   ├── App.tsx              # Componente principal
│   ├── ErrorBoundary.tsx    # Manejo de errores
│   ├── data.ts              # Datos de ejemplo
│   ├── docExport.ts         # Exportación a Word
│   ├── icons.tsx            # Íconos SVG
│   ├── index.css            # Estilos globales
│   ├── main.tsx             # Punto de entrada
│   ├── store.tsx            # Estado local (localStorage)
│   ├── storeSupabase.tsx    # Estado con Supabase
│   ├── supabaseClient.ts    # Cliente de Supabase
│   └── types.ts             # Tipos TypeScript
├── vercel.json              # Configuración de Vercel
├── package.json             # Dependencias
└── README.md                # Este archivo
```

## 🔧 Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Supabase** - Base de datos en la nube
- **date-fns** - Manejo de fechas
- **Vercel** - Hosting

## 📝 Notas

- La aplicación funciona tanto con Supabase como sin él (modo offline con localStorage)
- Los datos se sincronizan automáticamente cuando Supabase está disponible
- Si hay errores de conexión, la app sigue funcionando con los datos locales
- ErrorBoundary captura errores de renderizado y muestra un mensaje amigable

## 👩‍🏫 Autora

Prof. Liliana Álvarez

---

**Nota**: Si la vista previa de Qwen no funciona, descargá el proyecto y probalo localmente con `npm run dev` o subilo directamente a GitHub/Vercel.
