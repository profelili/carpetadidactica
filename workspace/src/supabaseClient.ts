import { createClient } from '@supabase/supabase-js';

// Credenciales de Supabase configuradas
const supabaseUrl = 'https://ovfwcbjkqtyeqkadvnlz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZndjYmprcXR5ZXFrYWR2bmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjI0OTUsImV4cCI6MjEwNDUzODQ5NX0.Bf-BJvrb44xa2SJ9CZfutIhj5QUAO-xPbQK5WIABVpI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript (deben coincidir con las tablas de Supabase)
export interface AlumnoDB {
  id: string;
  nombre: string;
  apellido: string;
  dni?: string;
  categoria: 'domiciliarios' | 'hospitalarios' | 'hogares' | 'otros';
  escuela_origen: string;
  grado: string;
  establecimiento: string;
  tutor?: string;
  estado: 'activo' | 'pausado' | 'egresado';
  fecha_alta: string;
  diagnostico?: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActividadDB {
  id: string;
  titulo: string;
  fecha: string;
  hora?: string;
  categoria: 'domiciliarios' | 'hospitalarios' | 'hogares' | 'otros';
  alumno_ids: string[];
  area: string;
  duracion?: string;
  objetivo?: string;
  consignas: string;
  recursos?: string;
  realizada: boolean;
  created_at?: string;
  updated_at?: string;
}
