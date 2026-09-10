import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Actividad, Alumno, Categoria, DB } from "./types";
import { catMeta } from "./types";

const GOOGLE_DOC_URL =
  "https://docs.google.com/document/d/1buIYM4ohPr3CnZ_Xz8rC9b1u1aDbTJe6/edit?usp=sharing&ouid=107978646342160764645&rtpof=true&sd=true";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const multi = (s: string) => esc(s).replace(/\n/g, "<br/>");

const TIT = "#123f35";

const docShell = (titulo: string, cuerpo: string) => `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${esc(titulo)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  body { font-family: 'Nunito Sans', Calibri, 'Segoe UI', Arial, sans-serif; color: #26303b; margin: 2.2cm; font-size: 11.5pt; }
  h1 { color: ${TIT}; font-size: 19pt; margin: 0 0 2pt 0; letter-spacing: .5px; }
  h2 { color: ${TIT}; font-size: 13pt; margin: 18pt 0 6pt 0; border-bottom: 2.5pt solid #ffc531; padding-bottom: 3pt; }
  h3 { color: #26303b; font-size: 12pt; margin: 10pt 0 2pt 0; }
  p { margin: 3pt 0; }
  .sub { color: #5d6874; font-size: 10.5pt; margin: 0 0 14pt 0; }
  .badge { display: inline-block; padding: 2pt 7pt; border-radius: 3pt; color: #ffffff; font-size: 9pt; font-weight: bold; }
  .meta { color: #5d6874; font-size: 10pt; }
  table { border-collapse: collapse; width: 100%; margin: 6pt 0 12pt 0; }
  th { background: #123f35; color: #e9f2ec; text-align: left; padding: 5pt 7pt; font-size: 9.5pt; text-transform: uppercase; letter-spacing: .4pt; }
  td { border: 0.75pt solid #c9d0d5; padding: 4.5pt 7pt; font-size: 10pt; vertical-align: top; }
  .pie { margin-top: 26pt; padding-top: 8pt; border-top: 0.75pt solid #c9d0d5; color: #8b95a1; font-size: 9pt; }
</style>
</head>
<body>${cuerpo}
<p class="pie">Carpeta Didáctica &mdash; generado el ${format(new Date(), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}. Abrir con Google Docs o Word.</p>
</body></html>`;

const cabecera = (titulo: string, docente: string, extra = "") => `
<h1>${esc(titulo)}</h1>
<p class="sub">Docente: <b>${esc(docente)}</b>${extra}</p>`;

export function descargarDoc(html: string, nombreArchivo: string) {
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${nombreArchivo}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

const estadoTxt = (e: Alumno["estado"]) =>
  e === "activo" ? "Activo" : e === "pausado" ? "Pausado" : "Egresado";

export function padronDoc(db: DB): string {
  const porCat = (c: Categoria) =>
    db.alumnos
      .filter((a) => a.categoria === c)
      .sort((a, b) => `${a.apellido}`.localeCompare(b.apellido));

  const secciones = (["domiciliarios", "hospitalarios", "hogares", "otros"] as Categoria[])
    .map((c) => {
      const m = catMeta(c);
      const lista = porCat(c);
      if (!lista.length) return "";
      const filas = lista
        .map(
          (a) => `<tr>
<td>${esc(a.apellido)}, ${esc(a.nombre)}</td>
<td>${esc(a.dni || "—")}</td>
<td>${esc(a.grado)}</td>
<td>${esc(a.escuelaOrigen)}</td>
<td>${esc(a.establecimiento)}</td>
<td>${estadoTxt(a.estado)}</td>
</tr>`
        )
        .join("");
      return `<h2>${m.label} <span style="color:#8b95a1;font-size:10pt;">(${lista.length})</span></h2>
<table><tr><th>Alumno/a</th><th>DNI</th><th>Grado</th><th>Escuela de origen</th><th>Establecimiento</th><th>Estado</th></tr>${filas}</table>`;
    })
    .join("");

  return docShell(
    "Padrón de alumnos — Carpeta Didáctica",
    `${cabecera("Padrón de alumnos", db.docente, ` &middot; Total: <b>${db.alumnos.length}</b> estudiantes`)}${secciones}`
  );
}

export function planificadorDoc(
  db: DB,
  actividades: Actividad[],
  filtro: { categoria: Categoria | "todas"; realizadas: boolean | null }
): string {
  const alumnos = new Map(db.alumnos.map((a) => [a.id, a]));
  const porFecha = new Map<string, Actividad[]>();
  for (const ac of actividades) {
    const arr = porFecha.get(ac.fecha) ?? [];
    arr.push(ac);
    porFecha.set(ac.fecha, arr);
  }
  const fechas = [...porFecha.keys()].sort();

  const chips = (ids: string[]) =>
    ids
      .map((id) => alumnos.get(id))
      .filter(Boolean)
      .map((a) => {
        const m = catMeta(a!.categoria);
        return `<span class="badge" style="background:${m.color};">${esc(a!.nombre)} ${esc(a!.apellido)}</span>`;
      })
      .join(" ");

  const tarjetas = fechas
    .map((f) => {
      const fechaLarga = format(new Date(`${f}T12:00:00`), "EEEE d 'de' MMMM", { locale: es });
      const items = porFecha
        .get(f)!
        .map((ac) => {
          const m = catMeta(ac.categoria);
          return `<h3>${esc(ac.titulo)}</h3>
<p class="meta"><span class="badge" style="background:${m.color};">${m.corto}</span>
&nbsp; ${ac.hora ? `&#128337; ${esc(ac.hora)} &nbsp;` : ""}${ac.duracion ? `&#9201; ${esc(ac.duracion)} &nbsp;` : ""}<b>${esc(ac.area)}</b>
&nbsp; ${ac.realizada ? "<b style='color:#0e7c66;'>&#10003; Realizada</b>" : "<i>Pendiente</i>"}</p>
${chips(ac.alumnoIds) ? `<p class="meta">Destinatarios: ${chips(ac.alumnoIds)}</p>` : ""}
${ac.objetivo ? `<p><b>Objetivo:</b> ${esc(ac.objetivo)}</p>` : ""}
<p><b>Consignas:</b><br/>${multi(ac.consignas)}</p>
${ac.recursos ? `<p><b>Recursos:</b> ${esc(ac.recursos)}</p>` : ""}`;
        })
        .join("");
      return `<h2>${fechaLarga.charAt(0).toUpperCase() + fechaLarga.slice(1)}</h2>${items}`;
    })
    .join("");

  const filtros = [
    filtro.categoria === "todas" ? "todas las modalidades" : catMeta(filtro.categoria).label,
    filtro.realizadas === null
      ? "pendientes y realizadas"
      : filtro.realizadas
        ? "solo realizadas"
        : "solo pendientes",
  ].join(" · ");

  return docShell(
    "Planificador de actividades — Carpeta Didáctica",
    `${cabecera("Planificador de actividades", db.docente, ` &middot; <b>${actividades.length}</b> actividades`)}
<p class="meta">Filtros aplicados: <b>${esc(filtros)}</b></p>
${tarjetas || "<p>No hay actividades para los filtros seleccionados.</p>"}`
  );
}

export const docGoogleUrl = GOOGLE_DOC_URL;
