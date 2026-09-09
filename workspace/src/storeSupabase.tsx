import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Actividad, Alumno, DB } from "./types";
import { uid } from "./types";
import { seedDB } from "./data";
import { supabase } from "./supabaseClient";

const KEY = "carpeta-didactica-db-v1";

export interface Toast {
  id: string;
  texto: string;
  tono: "ok" | "warn" | "info";
}

interface StoreValue {
  db: DB;
  toasts: Toast[];
  savedAt: string | null;
  guardando: boolean;
  sincronizando: boolean;
  usandoSupabase: boolean;
  addAlumno: (a: Omit<Alumno, "id">) => void;
  updateAlumno: (id: string, patch: Partial<Alumno>) => void;
  deleteAlumno: (id: string) => void;
  addActividad: (a: Omit<Actividad, "id">) => void;
  updateActividad: (id: string, patch: Partial<Actividad>) => void;
  deleteActividad: (id: string) => void;
  setDocente: (nombre: string) => void;
  resetDemo: () => void;
  importarDB: (nueva: DB) => void;
  sincronizarDesdeSupabase: () => Promise<void>;
  toast: (texto: string, tono?: Toast["tono"]) => void;
}

const Ctx = createContext<StoreValue | null>(null);

function loadLocal(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed && Array.isArray(parsed.alumnos) && Array.isArray(parsed.actividades)) {
        return parsed;
      }
    }
  } catch {
    /* datos corruptos: se regeneran */
  }
  return seedDB();
}

function saveLocal(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

// Verificar si Supabase está configurado correctamente
function isSupabaseConfigured(): boolean {
  try {
    const key = (supabase as any).supabaseKey;
    return key && key !== 'REEMPLAZAR_CON_CLAVE_ANON_CORRECTA' && key.startsWith('eyJ');
  } catch {
    return false;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadLocal);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [usandoSupabase, setUsandoSupabase] = useState(false);
  const firstRun = useRef(true);
  const supabaseReady = useRef(false);

  // Verificar si Supabase está configurado
  useEffect(() => {
    const configured = isSupabaseConfigured();
    setUsandoSupabase(configured);
    if (configured) {
      console.log('✅ Supabase configurado correctamente');
    } else {
      console.log('ℹ️ Usando localStorage (Supabase no configurado)');
    }
  }, []);

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    if (!usandoSupabase || supabaseReady.current) return;
    
    const cargarDesdeSupabase = async () => {
      setSincronizando(true);
      try {
        // Cargar alumnos
        const { data: alumnosData, error: alumnosError } = await supabase
          .from('alumnos')
          .select('*')
          .order('created_at', { ascending: false });

        if (alumnosError) throw alumnosError;

        // Cargar actividades
        const { data: actividadesData, error: actividadesError } = await supabase
          .from('actividades')
          .select('*')
          .order('fecha', { ascending: true });

        if (actividadesError) throw actividadesError;

        // Si hay datos en Supabase, usarlos
        if (alumnosData && alumnosData.length > 0) {
          const dbDesdeSupabase: DB = {
            alumnos: alumnosData.map(a => ({
              id: a.id,
              nombre: a.nombre,
              apellido: a.apellido,
              dni: a.dni,
              categoria: a.categoria,
              escuelaOrigen: a.escuela_origen,
              grado: a.grado,
              establecimiento: a.establecimiento,
              tutor: a.tutor,
              estado: a.estado,
              fechaAlta: a.fecha_alta,
              diagnostico: a.diagnostico,
              observaciones: a.observaciones,
            })),
            actividades: actividadesData.map(a => ({
              id: a.id,
              titulo: a.titulo,
              fecha: a.fecha,
              hora: a.hora,
              categoria: a.categoria,
              alumnoIds: a.alumno_ids || [],
              area: a.area,
              duracion: a.duracion,
              objetivo: a.objetivo,
              consignas: a.consignas,
              recursos: a.recursos,
              realizada: a.realizada,
            })),
            docente: 'Prof. Liliana Álvarez',
          };
          
          setDb(dbDesdeSupabase);
          saveLocal(dbDesdeSupabase);
          console.log('✅ Datos cargados desde Supabase');
        } else {
          // Si no hay datos en Supabase, subir los datos locales
          console.log('ℹ️ Supabase vacío, subiendo datos locales...');
          await subirDatosASupabase(db);
        }
        
        supabaseReady.current = true;
      } catch (error) {
        console.error('❌ Error cargando desde Supabase:', error);
      } finally {
        setSincronizando(false);
      }
    };

    cargarDesdeSupabase();
  }, [usandoSupabase]);

  // Función para subir datos locales a Supabase
  const subirDatosASupabase = async (datos: DB) => {
    if (!usandoSupabase) return;

    try {
      // Subir alumnos
      if (datos.alumnos.length > 0) {
        const alumnosParaSubir = datos.alumnos.map(a => ({
          id: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          dni: a.dni,
          categoria: a.categoria,
          escuela_origen: a.escuelaOrigen,
          grado: a.grado,
          establecimiento: a.establecimiento,
          tutor: a.tutor,
          estado: a.estado,
          fecha_alta: a.fechaAlta,
          diagnostico: a.diagnostico,
          observaciones: a.observaciones,
        }));

        const { error } = await supabase.from('alumnos').upsert(alumnosParaSubir);
        if (error) throw error;
      }

      // Subir actividades
      if (datos.actividades.length > 0) {
        const actividadesParaSubir = datos.actividades.map(a => ({
          id: a.id,
          titulo: a.titulo,
          fecha: a.fecha,
          hora: a.hora,
          categoria: a.categoria,
          alumno_ids: a.alumnoIds,
          area: a.area,
          duracion: a.duracion,
          objetivo: a.objetivo,
          consignas: a.consignas,
          recursos: a.recursos,
          realizada: a.realizada,
        }));

        const { error } = await supabase.from('actividades').upsert(actividadesParaSubir);
        if (error) throw error;
      }

      console.log('✅ Datos subidos a Supabase');
    } catch (error) {
      console.error('❌ Error subiendo a Supabase:', error);
    }
  };

  // Guardado automático en localStorage + sincronización con Supabase
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setGuardando(true);
    const t = setTimeout(async () => {
      saveLocal(db);
      const now = new Date();
      setSavedAt(`${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`);
      setGuardando(false);

      // Sincronizar con Supabase si está configurado
      if (usandoSupabase && supabaseReady.current) {
        setSincronizando(true);
        await subirDatosASupabase(db);
        setSincronizando(false);
      }
    }, 420);
    return () => clearTimeout(t);
  }, [db, usandoSupabase]);

  const toast = useCallback((texto: string, tono: Toast["tono"] = "ok") => {
    const id = uid();
    setToasts((ts) => [...ts, { id, texto, tono }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3800);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      db,
      toasts,
      savedAt,
      guardando,
      sincronizando,
      usandoSupabase,
      toast,
      addAlumno: (a) => setDb((p) => ({ ...p, alumnos: [{ ...a, id: uid() }, ...p.alumnos] })),
      updateAlumno: (id, patch) =>
        setDb((p) => ({
          ...p,
          alumnos: p.alumnos.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteAlumno: (id) =>
        setDb((p) => ({
          ...p,
          alumnos: p.alumnos.filter((x) => x.id !== id),
          actividades: p.actividades.map((ac) => ({
            ...ac,
            alumnoIds: ac.alumnoIds.filter((i) => i !== id),
          })),
        })),
      addActividad: (a) =>
        setDb((p) => ({ ...p, actividades: [...p.actividades, { ...a, id: uid() }] })),
      updateActividad: (id, patch) =>
        setDb((p) => ({
          ...p,
          actividades: p.actividades.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteActividad: (id) =>
        setDb((p) => ({ ...p, actividades: p.actividades.filter((x) => x.id !== id) })),
      setDocente: (nombre) => setDb((p) => ({ ...p, docente: nombre.trim() || p.docente })),
      resetDemo: () => {
        const fresh = seedDB();
        setDb(fresh);
        saveLocal(fresh);
        if (usandoSupabase) {
          subirDatosASupabase(fresh);
        }
      },
      importarDB: (nueva) => {
        if (
          !nueva ||
          !Array.isArray(nueva.alumnos) ||
          !Array.isArray(nueva.actividades)
        ) {
          toast("El archivo no parece un respaldo válido", "warn");
          return;
        }
        const dbImportada = {
          alumnos: nueva.alumnos,
          actividades: nueva.actividades,
          docente: typeof nueva.docente === "string" && nueva.docente ? nueva.docente : "Prof. Liliana Álvarez",
        };
        setDb(dbImportada);
        saveLocal(dbImportada);
        if (usandoSupabase) {
          subirDatosASupabase(dbImportada);
        }
        toast("Respaldo restaurado correctamente");
      },
      sincronizarDesdeSupabase: async () => {
        if (!usandoSupabase) {
          toast("Supabase no está configurado", "warn");
          return;
        }
        setSincronizando(true);
        try {
          const { data: alumnosData } = await supabase.from('alumnos').select('*');
          const { data: actividadesData } = await supabase.from('actividades').select('*');
          
          if (alumnosData && actividadesData) {
            const dbDesdeSupabase: DB = {
              alumnos: alumnosData.map(a => ({
                id: a.id,
                nombre: a.nombre,
                apellido: a.apellido,
                dni: a.dni,
                categoria: a.categoria,
                escuelaOrigen: a.escuela_origen,
                grado: a.grado,
                establecimiento: a.establecimiento,
                tutor: a.tutor,
                estado: a.estado,
                fechaAlta: a.fecha_alta,
                diagnostico: a.diagnostico,
                observaciones: a.observaciones,
              })),
              actividades: actividadesData.map(a => ({
                id: a.id,
                titulo: a.titulo,
                fecha: a.fecha,
                hora: a.hora,
                categoria: a.categoria,
                alumnoIds: a.alumno_ids || [],
                area: a.area,
                duracion: a.duracion,
                objetivo: a.objetivo,
                consignas: a.consignas,
                recursos: a.recursos,
                realizada: a.realizada,
              })),
              docente: 'Prof. Liliana Álvarez',
            };
            setDb(dbDesdeSupabase);
            saveLocal(dbDesdeSupabase);
            toast("Datos sincronizados desde Supabase");
          }
        } catch (error) {
          console.error('Error sincronizando:', error);
          toast("Error al sincronizar", "warn");
        } finally {
          setSincronizando(false);
        }
      },
    }),
    [db, toasts, savedAt, guardando, sincronizando, usandoSupabase, toast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore debe usarse dentro de StoreProvider");
  return v;
}
