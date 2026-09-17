// 🔥 NUEVO: Evita bucle infinito
const cargandoDesdeSupabase = useRef(false);
--- src/store.tsx (原始)
+++ src/store.tsx (修改后)
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
import { supabase, isSupabaseAvailable } from "./supabaseClient";

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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(loadLocal);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [usandoSupabase, setUsandoSupabase] = useState(false);

  // Refs para controlar el flujo de sincronización
  const firstRun = useRef(true);
  const supabaseReady = useRef(false);
  const cargandoDesdeSupabase = useRef(false); // 🔥 NUEVO: Evita bucle infinito

  // Verificar si Supabase está disponible
  useEffect(() => {
    const available = isSupabaseAvailable();
    setUsandoSupabase(available);
    if (available) {
      console.log('✅ Supabase disponible');
    } else {
      console.log('ℹ️ Usando localStorage (Supabase no disponible)');
    }
  }, []);

  // 🔥 CORREGIDO: Cargar datos desde Supabase al iniciar (solo una vez)
  useEffect(() => {
    if (!usandoSupabase || supabaseReady.current) return;
    if (!supabase) {
      console.warn('Supabase no está disponible');
      return;
    }

    const cargarDesdeSupabase = async () => {
      if (!supabase) return;

      cargandoDesdeSupabase.current = true; // 🔥 Marcar que estamos cargando
      setSincronizando(true);

      try {
        console.log('📥 Cargando datos desde Supabase...');

        // Cargar alumnos
        const { data: alumnosData, error: alumnosError } = await supabase
          .from('alumnos')
          .select('*')
          .order('created_at', { ascending: false });

        if (alumnosError) {
          console.warn('Error cargando alumnos:', alumnosError);
          setSincronizando(false);
          cargandoDesdeSupabase.current = false;
          return;
        }

        // Cargar actividades
        const { data: actividadesData, error: actividadesError } = await supabase
          .from('actividades')
          .select('*')
          .order('fecha', { ascending: true });

        if (actividadesError) {
          console.warn('Error cargando actividades:', actividadesError);
          setSincronizando(false);
          cargandoDesdeSupabase.current = false;
          return;
        }

        // Si hay datos en Supabase, usarlos
        if (alumnosData && alumnosData.length > 0) {
          console.log(`✅ ${alumnosData.length} alumnos encontrados en Supabase`);

          const dbDesdeSupabase: DB = {
            alumnos: alumnosData.map((a: any) => ({
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
            actividades: actividadesData?.map((a: any) => ({
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
            })) || [],
            docente: 'Prof. Liliana Álvarez',
          };

          setDb(dbDesdeSupabase);
          saveLocal(dbDesdeSupabase);
          console.log('✅ Datos cargados desde Supabase');
        } else {
          console.log('ℹ️ Supabase vacío, usando datos locales');
        }

        supabaseReady.current = true;
      } catch (error) {
        console.error('❌ Error cargando desde Supabase:', error);
      } finally {
        setSincronizando(false);
        // 🔥 IMPORTANTE: Esperar un poco antes de desmarcar para evitar race conditions
        setTimeout(() => {
          cargandoDesdeSupabase.current = false;
        }, 1000);
      }
    };

    cargarDesdeSupabase();
  }, [usandoSupabase]);

  // 🔥 CORREGIDO: Función para subir datos a Supabase (sin bucle)
  const subirDatosASupabase = async (datos: DB) => {
    // 🔥 Evitar subir si estamos cargando desde Supabase
    if (cargandoDesdeSupabase.current) {
      console.log('⏸️ Sincronización pausada: cargando desde Supabase');
      return;
    }

    if (!usandoSupabase || !supabase) return;

    try {
      console.log('📤 Sincronizando con Supabase...');

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
        if (error) {
          console.warn('Error subiendo alumnos:', error);
          return;
        }
        console.log(`✅ ${alumnosParaSubir.length} alumnos sincronizados`);
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
        if (error) {
          console.warn('Error subiendo actividades:', error);
          return;
        }
        console.log(`✅ ${actividadesParaSubir.length} actividades sincronizadas`);
      }

      console.log('✅ Sincronización completa');
    } catch (error) {
      console.error('❌ Error subiendo a Supabase:', error);
    }
  };

  // 🔥 CORREGIDO: Guardado automático (sin bucle infinito)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    // 🔥 No guardar si estamos cargando desde Supabase
    if (cargandoDesdeSupabase.current) {
      console.log('⏸️ Guardado automático pausado: cargando desde Supabase');
      return;
    }

    setGuardando(true);
    const t = setTimeout(async () => {
      saveLocal(db);
      const now = new Date();
      setSavedAt(`${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`);
      setGuardando(false);

      // 🔥 Solo sincronizar si Supabase está listo y no estamos cargando
      if (usandoSupabase && supabaseReady.current && !cargandoDesdeSupabase.current) {
        setSincronizando(true);
        await subirDatosASupabase(db);
        setSincronizando(false);
      }
    }, 1000); // 🔥 Aumentado a 1 segundo para evitar múltiples triggers

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
        if (usandoSupabase && !cargandoDesdeSupabase.current) {
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
        if (usandoSupabase && !cargandoDesdeSupabase.current) {
          subirDatosASupabase(dbImportada);
        }
        toast("Respaldo restaurado correctamente");
      },
      sincronizarDesdeSupabase: async () => {
        if (!usandoSupabase || !supabase) {
          toast("Supabase no está disponible", "warn");
          return;
        }
        setSincronizando(true);
        cargandoDesdeSupabase.current = true;
        try {
          const { data: alumnosData } = await supabase.from('alumnos').select('*');
          const { data: actividadesData } = await supabase.from('actividades').select('*');

          if (alumnosData && actividadesData) {
            const dbDesdeSupabase: DB = {
              alumnos: alumnosData.map((a: any) => ({
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
              actividades: actividadesData.map((a: any) => ({
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
          setTimeout(() => {
            cargandoDesdeSupabase.current = false;
          }, 1000);
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
