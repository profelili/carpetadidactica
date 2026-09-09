export type Categoria = "domiciliarios" | "hospitalarios" | "hogares" | "otros";

export type EstadoAlumno = "activo" | "pausado" | "egresado";

export interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  dni?: string;
  categoria: Categoria;
  escuelaOrigen: string;
  grado: string;
  establecimiento: string; // hospital, hogar, domicilio (zona), etc.
  tutor?: string;
  estado: EstadoAlumno;
  fechaAlta: string; // ISO yyyy-mm-dd
  diagnostico?: string;
  observaciones?: string;
}

export interface Actividad {
  id: string;
  titulo: string;
  fecha: string; // ISO yyyy-mm-dd
  hora?: string;
  categoria: Categoria;
  alumnoIds: string[];
  area: string;
  duracion?: string;
  objetivo?: string;
  consignas: string;
  recursos?: string;
  realizada: boolean;
}

export interface DB {
  alumnos: Alumno[];
  actividades: Actividad[];
  docente: string;
}

export interface CategoriaMeta {
  id: Categoria;
  label: string;
  corto: string;
  color: string;
  descripcion: string;
}

export const CATEGORIAS: CategoriaMeta[] = [
  {
    id: "domiciliarios",
    label: "Alumnos Domiciliarios",
    corto: "Domiciliarios",
    color: "#0e7c66",
    descripcion: "Escolaridad en el domicilio por indicación médica.",
  },
  {
    id: "hospitalarios",
    label: "Alumnos Hospitalarios",
    corto: "Hospitalarios",
    color: "#2f6fb2",
    descripcion: "Aulas hospitalarias y seguimiento en internación.",
  },
  {
    id: "hogares",
    label: "Alumnos de Hogares",
    corto: "Hogares",
    color: "#d97e12",
    descripcion: "Niños y jóvenes en hogares convivenciales.",
  },
  {
    id: "otros",
    label: "Otros",
    corto: "Otros",
    color: "#64718a",
    descripcion: "Trayectorias especiales y otras modalidades.",
  },
];

export const catMeta = (c: Categoria): CategoriaMeta =>
  CATEGORIAS.find((m) => m.id === c) ?? CATEGORIAS[3];

export const hexA = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const AREAS = [
  "Matemática",
  "Lengua y Literatura",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Inglés",
  "Artística",
  "Educación Física",
  "Tecnología",
  "Acompañamiento pedagógico",
];

export const GRADOS = [
  "1.º grado",
  "2.º grado",
  "3.º grado",
  "4.º grado",
  "5.º grado",
  "6.º grado",
  "7.º grado",
  "1.º año",
  "2.º año",
  "3.º año",
  "4.º año",
  "5.º año",
  "Sala de 4",
  "Sala de 5",
];

export type Vista =
  | "dashboard"
  | "domiciliarios"
  | "hospitalarios"
  | "hogares"
  | "otros"
  | "panel"
  | "planificador";

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const hoyISO = () => {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export const sumarDias = (base: Date, dias: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export const iniciales = (a: { nombre: string; apellido: string }) =>
  `${a.nombre.charAt(0)}${a.apellido.charAt(0)}`.toUpperCase();
