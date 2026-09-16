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
  const firstRun = useRef(true);
  const supabaseReady = useRef(false);
  const datosInicialesSubidos = useRef(false);
  const dbAnterior = useRef<DB | null>(null);

  // Verificar si Supabase está disponible
  useEffect(() => {
    const verificarSupabase = async () => {
      const available = await isSupabaseAvailable();
      setUsandoSupabase(available);
      if (available) {
        console.log('✅ Supabase disponible y conectado');
      } else {
        console.log('ℹ️ Usando localStorage (Supabase no disponible)');
      }
    };
    verificarSupabase();
  }, []);

  // Función para subir datos a Supabase (solo cambios incrementales)
  const subirDatosASupabase = async (datos: DB, esInicial: boolean = false) => {
    if (!usandoSupabase || !supabase) return;

    try {
      // Si es la primera vez, subir todo
      if (esInicial || !dbAnterior.current) {
        console.log('📤 Subiendo datos iniciales a Supabase...');
        
        // Subir alumnos
        if (datos.alumnos.length > 0) {
          const alumnosParaSubir = datos.alumnos.map(a => ({
            nombre: a.nombre,
            apellido: a.apellido,
            dni: a.dni || null,
            categoria: a.categoria,
            escuela_origen: a.escuelaOrigen,
            grado: a.grado,
            establecimiento: a.establecimiento,
            tutor: a.tutor || null,
            estado: a.estado,
            fecha_alta: a.fechaAlta,
            diagnostico: a.diagnostico || null,
            observaciones: a.observaciones || null,
          }));

          const { data: alumnosInsertados, error } = await supabase.from('alumnos').insert(alumnosParaSubir).select();
          if (error) {
            console.warn('Error subiendo alumnos:', error);
            return;
          }
          
          // Actualizar IDs locales con los de Supabase
          if (alumnosInsertados) {
            const alumnosConIds = datos.alumnos.map((a, i) => ({
              ...a,
              id: alumnosInsertados[i]?.id || a.id
            }));
            setDb(prev => ({ ...prev, alumnos: alumnosConIds }));
            console.log('✅ IDs de alumnos actualizados desde Supabase');
          }
        }

        // Subir actividades
        if (datos.actividades.length > 0) {
          const actividadesParaSubir = datos.actividades.map(a => ({
            titulo: a.titulo,
            fecha: a.fecha,
            hora: a.hora || null,
            categoria: a.categoria,
            alumno_ids: a.alumnoIds || [],
            area: a.area,
            duracion: a.duracion || null,
            objetivo: a.objetivo || null,
            consignas: a.consignas,
            recursos: a.recursos || null,
            realizada: a.realizada,
          }));

          const { data: actividadesInsertadas, error } = await supabase.from('actividades').insert(actividadesParaSubir).select();
          if (error) {
            console.warn('Error subiendo actividades:', error);
            return;
          }
          
          // Actualizar IDs locales con los de Supabase
          if (actividadesInsertadas) {
            const actividadesConIds = datos.actividades.map((a, i) => ({
              ...a,
              id: actividadesInsertadas[i]?.id || a.id
            }));
            setDb(prev => ({ ...prev, actividades: actividadesConIds }));
            console.log('✅ IDs de actividades actualizados desde Supabase');
          }
        }

        console.log('✅ Datos iniciales subidos a Supabase');
        return;
      }

      // Sincronización incremental: comparar cambios
      const anterior = dbAnterior.current;
      
      // Detectar alumnos nuevos, modificados y eliminados
      const alumnosNuevos = datos.alumnos.filter(a => !anterior.alumnos.some(pa => pa.id === a.id));
      const alumnosModificados = datos.alumnos.filter(a => {
        const pa = anterior.alumnos.find(pa => pa.id === a.id);
        return pa && JSON.stringify(pa) !== JSON.stringify(a);
      });
      const alumnosEliminados = anterior.alumnos.filter(pa => !datos.alumnos.some(a => a.id === pa.id));

      // Subir alumnos nuevos
      if (alumnosNuevos.length > 0) {
        console.log(`📤 Subiendo ${alumnosNuevos.length} alumno(s) nuevo(s)...`);
        const alumnosParaSubir = alumnosNuevos.map(a => ({
          nombre: a.nombre,
          apellido: a.apellido,
          dni: a.dni || null,
          categoria: a.categoria,
          escuela_origen: a.escuelaOrigen,
          grado: a.grado,
          establecimiento: a.establecimiento,
          tutor: a.tutor || null,
          estado: a.estado,
          fecha_alta: a.fechaAlta,
          diagnostico: a.diagnostico || null,
          observaciones: a.observaciones || null,
        }));

        const { data: alumnosInsertados, error } = await supabase.from('alumnos').insert(alumnosParaSubir).select();
        if (error) {
          console.warn('Error subiendo alumnos nuevos:', error);
        } else if (alumnosInsertados) {
          // Actualizar IDs locales
          const alumnosConIds = datos.alumnos.map(a => {
            const nuevo = alumnosNuevos.find(n => n.id === a.id);
            if (nuevo) {
              const insertado = alumnosInsertados.find(ins => 
                ins.nombre === nuevo.nombre && ins.apellido === nuevo.apellido
              );
              return insertado ? { ...a, id: insertado.id } : a;
            }
            return a;
          });
          setDb(prev => ({ ...prev, alumnos: alumnosConIds }));
          console.log('✅ Alumnos nuevos subidos y IDs actualizados');
        }
      }

      // Actualizar alumnos modificados
      if (alumnosModificados.length > 0) {
        console.log(`📝 Actualizando ${alumnosModificados.length} alumno(s)...`);
        for (const a of alumnosModificados) {
          const { error } = await supabase.from('alumnos').update({
            nombre: a.nombre,
            apellido: a.apellido,
            dni: a.dni || null,
            categoria: a.categoria,
            escuela_origen: a.escuelaOrigen,
            grado: a.grado,
            establecimiento: a.establecimiento,
            tutor: a.tutor || null,
            estado: a.estado,
            fecha_alta: a.fechaAlta,
            diagnostico: a.diagnostico || null,
            observaciones: a.observaciones || null,
          }).eq('id', a.id);
          
          if (error) {
            console.warn(`Error actualizando alumno ${a.id}:`, error);
          }
        }
        console.log('✅ Alumnos modificados actualizados');
      }

      // Eliminar alumnos eliminados
      if (alumnosEliminados.length > 0) {
        console.log(`🗑️ Eliminando ${alumnosEliminados.length} alumno(s)...`);
        for (const a of alumnosEliminados) {
          const { error } = await supabase.from('alumnos').delete().eq('id', a.id);
          if (error) {
            console.warn(`Error eliminando alumno ${a.id}:`, error);
          }
        }
        console.log('✅ Alumnos eliminados');
      }

      // Detectar actividades nuevas, modificadas y eliminadas
      const actividadesNuevas = datos.actividades.filter(a => !anterior.actividades.some(pa => pa.id === a.id));
      const actividadesModificadas = datos.actividades.filter(a => {
        const pa = anterior.actividades.find(pa => pa.id === a.id);
        return pa && JSON.stringify(pa) !== JSON.stringify(a);
      });
      const actividadesEliminadas = anterior.actividades.filter(pa => !datos.actividades.some(a => a.id === pa.id));

      // Subir actividades nuevas
      if (actividadesNuevas.length > 0) {
        console.log(`📤 Subiendo ${actividadesNuevas.length} actividad(es) nueva(s)...`);
        const actividadesParaSubir = actividadesNuevas.map(a => ({
          titulo: a.titulo,
          fecha: a.fecha,
          hora: a.hora || null,
          categoria: a.categoria,
          alumno_ids: a.alumnoIds || [],
          area: a.area,
          duracion: a.duracion || null,
          objetivo: a.objetivo || null,
          consignas: a.consignas,
          recursos: a.recursos || null,
          realizada: a.realizada,
        }));

        const { data: actividadesInsertadas, error } = await supabase.from('actividades').insert(actividadesParaSubir).select();
        if (error) {
          console.warn('Error subiendo actividades nuevas:', error);
        } else if (actividadesInsertadas) {
          // Actualizar IDs locales
          const actividadesConIds = datos.actividades.map(a => {
            const nueva = actividadesNuevas.find(n => n.id === a.id);
            if (nueva) {
              const insertada = actividadesInsertadas.find(ins => 
                ins.titulo === nueva.titulo && ins.fecha === nueva.fecha
              );
              return insertada ? { ...a, id: insertada.id } : a;
            }
            return a;
          });
          setDb(prev => ({ ...prev, actividades: actividadesConIds }));
          console.log('✅ Actividades nuevas subidas y IDs actualizados');
        }
      }

      // Actualizar actividades modificadas
      if (actividadesModificadas.length > 0) {
        console.log(`📝 Actualizando ${actividadesModificadas.length} actividad(es)...`);
        for (const a of actividadesModificadas) {
          const { error } = await supabase.from('actividades').update({
            titulo: a.titulo,
            fecha: a.fecha,
            hora: a.hora || null,
            categoria: a.categoria,
            alumno_ids: a.alumnoIds || [],
            area: a.area,
            duracion: a.duracion || null,
            objetivo: a.objetivo || null,
            consignas: a.consignas,
            recursos: a.recursos || null,
            realizada: a.realizada,
          }).eq('id', a.id);
          
          if (error) {
            console.warn(`Error actualizando actividad ${a.id}:`, error);
          }
        }
        console.log('✅ Actividades modificadas actualizadas');
      }

      // Eliminar actividades eliminadas
      if (actividadesEliminadas.length > 0) {
        console.log(`🗑️ Eliminando ${actividadesEliminadas.length} actividad(es)...`);
        for (const a of actividadesEliminadas) {
          const { error } = await supabase.from('actividades').delete().eq('id', a.id);
          if (error) {
            console.warn(`Error eliminando actividad ${a.id}:`, error);
          }
        }
        console.log('✅ Actividades eliminadas');
      }

    } catch (error) {
      console.error('❌ Error subiendo a Supabase:', error);
    }
  };

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    if (!usandoSupabase || supabaseReady.current) return;
    if (!supabase) {
      console.warn('Supabase no está disponible');
      return;
    }
    
    const cargarDesdeSupabase = async () => {
      if (!supabase) return;
      setSincronizando(true);
      try {
        console.log('🔄 Cargando datos desde Supabase...');
        
        // SIEMPRE cargar desde Supabase primero
        const { data: alumnosData, error: alumnosError } = await supabase
          .from('alumnos')
          .select('*')
          .order('created_at', { ascending: false });

        if (alumnosError) {
          console.warn('Error cargando alumnos:', alumnosError);
          setSincronizando(false);
          return;
        }

        const { data: actividadesData, error: actividadesError } = await supabase
          .from('actividades')
          .select('*')
          .order('fecha', { ascending: true });

        if (actividadesError) {
          console.warn('Error cargando actividades:', actividadesError);
          setSincronizando(false);
          return;
        }

        // Si Supabase tiene datos, usar ESOS datos (fuente de verdad)
        if (alumnosData && alumnosData.length > 0) {
          console.log(`✅ Supabase tiene ${alumnosData.length} alumnos, usándolos como fuente de verdad`);
          
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
          
          // Usar datos de Supabase y actualizar localStorage
          setDb(dbDesdeSupabase);
          saveLocal(dbDesdeSupabase);
          dbAnterior.current = dbDesdeSupabase;
          console.log('✅ Datos de Supabase cargados y localStorage actualizado');
        } else if (!datosInicialesSubidos.current) {
          // Supabase está vacío, subir datos locales UNA SOLA VEZ
          console.log('ℹ️ Supabase vacío, subiendo datos locales (primera vez)...');
          datosInicialesSubidos.current = true;
          
          // Subir datos locales a Supabase
          await subirDatosASupabase(db, true);
          
          // IMPORTANTE: Recargar desde Supabase para obtener los IDs correctos
          console.log('🔄 Recargando datos desde Supabase después de subir...');
          const { data: alumnosRecargados } = await supabase.from('alumnos').select('*');
          const { data: actividadesRecargadas } = await supabase.from('actividades').select('*');
          
          if (alumnosRecargados && alumnosRecargados.length > 0) {
            const dbDesdeSupabase: DB = {
              alumnos: alumnosRecargados.map((a: any) => ({
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
              actividades: actividadesRecargadas?.map((a: any) => ({
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
            
            // Usar datos de Supabase con IDs correctos
            setDb(dbDesdeSupabase);
            saveLocal(dbDesdeSupabase);
            dbAnterior.current = dbDesdeSupabase;
            console.log('✅ Datos recargados desde Supabase con IDs correctos');
          }
        }
        
        supabaseReady.current = true;
      } catch (error) {
        console.error('❌ Error cargando desde Supabase:', error);
      } finally {
        setSincronizando(false);
      }
    };

    cargarDesdeSupabase();
  }, [usandoSupabase, supabase]);

  // Guardado automático en localStorage + sincronización con Supabase
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      dbAnterior.current = db;
      return;
    }
    setGuardando(true);
    const t = setTimeout(async () => {
      saveLocal(db);
      const now = new Date();
      setSavedAt(`${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`);
      setGuardando(false);

      // Sincronizar con Supabase si está disponible
      if (usandoSupabase && supabaseReady.current) {
        setSincronizando(true);
        await subirDatosASupabase(db);
        dbAnterior.current = db;
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
        if (!usandoSupabase || !supabase) {
          toast("Supabase no está disponible", "warn");
          return;
        }
        setSincronizando(true);
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
