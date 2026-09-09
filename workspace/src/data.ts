import type { Actividad, Alumno, DB } from "./types";
import { sumarDias } from "./types";

export function seedDB(): DB {
  const hoy = new Date();
  const d = (n: number) => sumarDias(hoy, n);

  const alumnos: Alumno[] = [
    {
      id: "a1", nombre: "Valentina", apellido: "Ríos", dni: "54.318.220",
      categoria: "domiciliarios", escuelaOrigen: "Esc. Primaria N.º 12 «M. Belgrano»",
      grado: "4.º grado", establecimiento: "Domicilio — Barrio Norte",
      tutor: "Marina Ríos (mamá)", estado: "activo", fechaAlta: d(-40),
      diagnostico: "Reposo postoperatorio — 60 días",
      observaciones: "Le encantan los animales; usar cuentos con fauna litoral.",
    },
    {
      id: "a2", nombre: "Tomás", apellido: "Aguirre", dni: "53.902.114",
      categoria: "domiciliarios", escuelaOrigen: "Esc. Primaria N.º 4",
      grado: "2.º grado", establecimiento: "Domicilio — Zona Sur",
      tutor: "Hugo Aguirre (papá)", estado: "activo", fechaAlta: d(-21),
      diagnostico: "Tratamiento prolongado",
      observaciones: "Sesiones cortas (40 min) por la medicación de la mañana.",
    },
    {
      id: "a3", nombre: "Bautista", apellido: "Ledezma",
      categoria: "hospitalarios", escuelaOrigen: "Esc. Primaria N.º 31",
      grado: "5.º grado", establecimiento: "Hospital de Niños — Sala 4",
      estado: "activo", fechaAlta: d(-12), diagnostico: "Internación — postquirúrgico",
      observaciones: "Trabaja mejor con material concreto y juegos de mesa.",
    },
    {
      id: "a4", nombre: "Uma", apellido: "Ferreyra", dni: "55.120.987",
      categoria: "hospitalarios", escuelaOrigen: "Jardín «Rayito de Sol»",
      grado: "Sala de 5", establecimiento: "Hospital Italiano — Sala 2",
      tutor: "Carla Ferreyra (mamá)", estado: "activo", fechaAlta: d(-8),
      observaciones: "Nivel inicial: priorizar juego, recortes y pegado.",
    },
    {
      id: "a5", nombre: "Santino", apellido: "Peralta",
      categoria: "hospitalarios", escuelaOrigen: "E.E.T. N.º 2",
      grado: "2.º año", establecimiento: "Sanatorio Plaza — Hab. 302",
      estado: "pausado", fechaAlta: d(-30), diagnostico: "Alta médica próxima",
      observaciones: "Esperando el alta; retomar coordinación con la escuela técnica.",
    },
    {
      id: "a6", nombre: "Luana", apellido: "Benítez", dni: "54.770.341",
      categoria: "hogares", escuelaOrigen: "Esc. Primaria N.º 18",
      grado: "6.º grado", establecimiento: "Hogar Convivencial «La Cigarra»",
      tutor: "Roxana Díaz (operadora)", estado: "activo", fechaAlta: d(-60),
      observaciones: "Muy hábil en dibujo: usar láminas y afiches.",
    },
    {
      id: "a7", nombre: "Dylan", apellido: "Sosa",
      categoria: "hogares", escuelaOrigen: "Esc. Primaria N.º 18",
      grado: "3.º grado", establecimiento: "Hogar Convivencial «La Cigarra»",
      estado: "activo", fechaAlta: d(-55),
      observaciones: "Refuerzo de lectoescritura; sesiones con su hermana Luana.",
    },
    {
      id: "a8", nombre: "Martina", apellido: "Cáceres", dni: "52.405.660",
      categoria: "otros", escuelaOrigen: "Esc. Primaria N.º 7",
      grado: "7.º grado", establecimiento: "Escuela domiciliaria transitoria",
      estado: "activo", fechaAlta: d(-15), diagnostico: "Trayectoria interrumpida — revinculación",
      observaciones: "Plan de revinculación con la escuela de origen.",
    },
    {
      id: "a9", nombre: "Facundo", apellido: "Quiroga",
      categoria: "otros", escuelaOrigen: "E.E.M. N.º 5",
      grado: "1.º año", establecimiento: "Acompañamiento virtual",
      estado: "egresado", fechaAlta: d(-120), diagnostico: "Alta de modalidad",
      observaciones: "Reincorporado a la escuela común en marzo. ¡Felicitaciones!",
    },
  ];

  const al = (nombre: string) => alumnos.find((a) => a.nombre === nombre)!;

  const actividades: Actividad[] = [
    {
      id: "t1", titulo: "Lectura compartida: «El bosque del litoral»", fecha: d(0),
      hora: "10:00", categoria: "domiciliarios", alumnoIds: [al("Valentina").id],
      area: "Lengua y Literatura", duracion: "45 min",
      objetivo: "Comprensión lectora y renarración oral.",
      consignas: "1) Lectura en voz alta por turnos.\n2) Dibujar la escena favorita.\n3) Renarrar la historia con títeres de dedo.",
      recursos: "Cuento impreso, títeres, hojas A4", realizada: false,
    },
    {
      id: "t2", titulo: "Sumas y restas con el kiosco del aula", fecha: d(0),
      hora: "15:00", categoria: "hospitalarios", alumnoIds: [al("Bautista").id],
      area: "Matemática", duracion: "40 min",
      objetivo: "Operaciones básicas con dinero.",
      consignas: "1) Armar precios de productos.\n2) Simular compras y vueltos.\n3) Registrar operaciones en la libreta.",
      recursos: "Billetes didácticos, libreta, calculadora", realizada: false,
    },
    {
      id: "t3", titulo: "Expedición: los animales de la sala", fecha: d(-1),
      hora: "11:00", categoria: "hospitalarios", alumnoIds: [al("Uma").id],
      area: "Ciencias Naturales", duracion: "35 min",
      objetivo: "Clasificar seres vivos según características.",
      consignas: "1) Buscar imágenes de animales en revistas.\n2) Clasificar por cantidad de patas.\n3) Pegar en el cuaderno de ciencias.",
      recursos: "Revistas, tijera, plasticola, cuaderno", realizada: true,
    },
    {
      id: "t4", titulo: "Fracciones con receta de bizcochuelo", fecha: d(1),
      hora: "10:30", categoria: "domiciliarios", alumnoIds: [al("Valentina").id, al("Tomás").id],
      area: "Matemática", duracion: "50 min",
      objetivo: "Medio, cuarto y octavo a partir de una receta.",
      consignas: "1) Leer la receta e identificar medidas.\n2) Representar 1/2, 1/4 y 1/8 con círculos de papel.\n3) Adaptar la receta para la mitad de comensales.",
      recursos: "Receta, círculos de papel de colores", realizada: false,
    },
    {
      id: "t5", titulo: "Taller de cómic: mi superhéroe cotidiano", fecha: d(2),
      hora: "16:00", categoria: "hogares", alumnoIds: [al("Luana").id, al("Dylan").id],
      area: "Artística", duracion: "60 min",
      objetivo: "Narrativa gráfica y producción escrita breve.",
      consignas: "1) Inventar un personaje del hogar.\n2) Planificar 4 viñetas.\n3) Entintar y escribir los diálogos.",
      recursos: "Fibrones, viñetas impresas, lápices de color", realizada: false,
    },
    {
      id: "t6", titulo: "Línea de tiempo: la historia de mi barrio", fecha: d(3),
      hora: "09:30", categoria: "otros", alumnoIds: [al("Martina").id],
      area: "Ciencias Sociales", duracion: "45 min",
      objetivo: "Ubicar hechos en el tiempo y trabajar fuentes orales.",
      consignas: "1) Entrevistar a un adulto sobre el barrio.\n2) Ordenar 8 hitos en la línea de tiempo.\n3) Escribir una conclusión breve.",
      recursos: "Guía de entrevista, afiche, marcadores", realizada: false,
    },
    {
      id: "t7", titulo: "Dictado dibujado de palabras con mb", fecha: d(-2),
      hora: "14:00", categoria: "hogares", alumnoIds: [al("Dylan").id],
      area: "Lengua y Literatura", duracion: "30 min",
      objetivo: "Ortografía del grupo mb con apoyo visual.",
      consignas: "1) Dictar 10 palabras.\n2) Dibujar el significado al lado.\n3) Corregir entre pares con lápiz verde.",
      recursos: "Lista de palabras, cuaderno, lápiz verde", realizada: true,
    },
  ];

  return { alumnos, actividades, docente: "Prof. Liliana Álvarez" };
}
