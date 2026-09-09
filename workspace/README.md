# 📁 Carpeta Didáctica

Aplicación web para organizar clases de modalidades especiales (domiciliarias, hospitalarias, hogares convivenciales y otras), con base de datos de alumnos, planificador de actividades, exportación a archivos `.doc` y sincronización en la nube con Supabase.

Hecha con **React + Vite + Tailwind CSS + Supabase**.

---

## 🌟 Características

- ✅ Panel de control con botones para diferentes modalidades de alumnos
- ✅ Base de datos de alumnos con filtros y buscador
- ✅ Planificador de actividades por fecha y modalidad
- ✅ Exportación a archivos `.doc` (compatibles con Word y Google Docs)
- ✅ Sincronización en la nube con Supabase
- ✅ Sistema de respaldo y restauración mediante archivos JSON
- ✅ Diseño temático de carpeta escolar con pizarrón y cuaderno
- ✅ Totalmente responsivo (funciona en computadora, tablet y celular)

---

## 🚀 Despliegue en Vercel (Recomendado)

### Opción 1: Conectar con GitHub (Automático)

1. Subí este proyecto a tu repositorio de GitHub
2. Andá a: https://vercel.com/new
4. Conectá con GitHub y seleccioná el repositorio
5. Vercel detectará automáticamente la configuración
6. Esperá 2-3 minutos y tu sitio estará listo

### Opción 2: Subir manualmente

1. Descargá este proyecto como ZIP
2. Descomprimí el archivo
3. Andá a: https://vercel.com/new
4. Arrastrá la carpeta completa
5. Vercel compilará automáticamente

---

## 🗄️ Configuración de Supabase

La aplicación usa Supabase para sincronizar datos en la nube.

### Paso 1: Crear proyecto en Supabase

1. Andá a: https://supabase.com
2. Creá una cuenta gratuita (podés usar tu cuenta de GitHub)
3. Creá un nuevo proyecto
4. Esperá a que se inicialice (1-2 minutos)

### Paso 2: Obtener credenciales

1. En tu proyecto de Supabase, andá a **Settings → API**
2. Copiá:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public key** (empieza con `eyJ...`)

### Paso 3: Configurar la aplicación

1. Abrí el archivo `src/supabaseClient.ts`
2. Reemplazá las credenciales:

```typescript
const supabaseUrl = 'TU_URL_AQUI';
const supabaseAnonKey = 'TU_CLAVE_ANON_AQUI';
```

### Paso 4: Crear las tablas

1. En Supabase, andá a **SQL Editor**
2. Creá una nueva consulta
3. Ejecutá este SQL:

```sql
-- Crear tabla alumnos
CREATE TABLE IF NOT EXISTS alumnos (
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

-- Crear tabla actividades
CREATE TABLE IF NOT EXISTS actividades (
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

-- Políticas de seguridad (permitir todo)
CREATE POLICY "Permitir lectura pública de alumnos" ON alumnos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de actividades" ON actividades FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública de alumnos" ON alumnos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción pública de actividades" ON actividades FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública de alumnos" ON alumnos FOR UPDATE USING (true);
CREATE POLICY "Permitir actualización pública de actividades" ON actividades FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación pública de alumnos" ON alumnos FOR DELETE USING (true);
CREATE POLICY "Permitir eliminación pública de actividades" ON actividades FOR DELETE USING (true);
```

4. Verificá que se crearon las tablas en **Table Editor**

---

## 🧪 Probar en tu computadora

```bash
npm install
npm run dev
```

Luego abrí la dirección que muestra la terminal (http://localhost:5173).

---

## 🔁 Pasar tus datos a otra computadora

### Opción 1: Con Supabase (Recomendado)

Si configuraste Supabase, tus datos se sincronizan automáticamente. Solo necesitás abrir la aplicación desde cualquier dispositivo con las mismas credenciales.

### Opción 2: Respaldo manual

1. En la app: **Panel de alumnos → Respaldo** (descarga un `.json`)
2. En la otra computadora abrí la app y tocá **Restaurar**, eligiendo ese archivo

---

## 📄 Exportar a documentos

- **Padrón .doc** — listado completo de alumnos, por modalidad
- **Guardar planificador en .doc** — actividades agrupadas por fecha, con alumnos, objetivos, consignas y recursos
- Los archivos se abren directamente desde Google Docs o Word

---

## 📦 Estructura del proyecto

```
carpetadidactica/
├── src/
│   ├── components/       # Componentes React
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   ├── store.tsx        # Estado local (localStorage)
│   ├── storeSupabase.tsx # Estado con Supabase
│   ├── supabaseClient.ts # Cliente de Supabase
│   ├── types.ts         # Tipos TypeScript
│   ├── data.ts          # Datos de ejemplo
│   ├── docExport.ts     # Exportación a .doc
│   └── icons.tsx        # Íconos SVG
├── public/              # Archivos estáticos
├── vercel.json          # Configuración de Vercel
├── package.json         # Dependencias
└── README.md            # Este archivo
```

---

## 🔧 Tecnologías utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **Supabase** - Base de datos en la nube
- **date-fns** - Manejo de fechas
- **Vercel** - Hosting y despliegue

---

## 📝 Licencia

Este proyecto es de uso personal para la Prof. Liliana Álvarez.

---

Prof. Liliana Álvarez ✏️
