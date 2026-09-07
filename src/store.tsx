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
  addAlumno: (a: Omit<Alumno, "id">) => void;
  updateAlumno: (id: string, patch: Partial<Alumno>) => void;
  deleteAlumno: (id: string) => void;
  addActividad: (a: Omit<Actividad, "id">) => void;
  updateActividad: (id: string, patch: Partial<Actividad>) => void;
  deleteActividad: (id: string) => void;
  setDocente: (nombre: string) => void;
  resetDemo: () => void;
  importarDB: (nueva: DB) => void;
  toast: (texto: string, tono?: Toast["tono"]) => void;
}

const Ctx = createContext<StoreValue | null>(null);

function load(): DB {
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const firstRun = useRef(true);

  // Guardado automático persistente
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setGuardando(true);
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(db));
      } catch {
        /* almacenamiento lleno o bloqueado */
      }
      const now = new Date();
      setSavedAt(`${`${now.getHours()}`.padStart(2, "0")}:${`${now.getMinutes()}`.padStart(2, "0")}`);
      setGuardando(false);
    }, 420);
    return () => clearTimeout(t);
  }, [db]);

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
        localStorage.setItem(KEY, JSON.stringify(fresh));
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
        setDb({
          alumnos: nueva.alumnos,
          actividades: nueva.actividades,
          docente: typeof nueva.docente === "string" && nueva.docente ? nueva.docente : "Prof. Liliana Álvarez",
        });
        toast("Respaldo restaurado correctamente");
      },
    }),
    [db, toasts, savedAt, guardando, toast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore debe usarse dentro de StoreProvider");
  return v;
}
