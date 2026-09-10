import { useEffect, useState, type CSSProperties } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useStore } from "../store";
import { CATEGORIAS, catMeta, hexA, type Vista } from "../types";
import { descargarDoc, docGoogleUrl, padronDoc, planificadorDoc } from "../docExport";
import { IcAgenda, IcDoc, IcEstrella, IcFlecha, IcGoogle, IcReloj, IcTacho } from "../icons";

const ICONOS = {
  domiciliarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="1.6em" height="1.6em">
      <path d="m3.5 11 8.5-7 8.5 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5.5h4V20" />
    </svg>
  ),
  hospitalarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="1.6em" height="1.6em">
      <path d="M5 20V6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5V20" /><path d="M3 20h18" /><path d="M12 9v6" /><path d="M9 12h6" /><path d="M8.5 5V3.5h7V5" />
    </svg>
  ),
  hogares: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="1.6em" height="1.6em">
      <path d="m3.5 11.5 8.5-7 8.5 7" /><path d="M5.5 10V20h13V10" />
      <circle cx="9.7" cy="13.2" r="1.5" /><path d="M7 17.5c.4-1.4 1.4-2.1 2.7-2.1s2.3.7 2.7 2.1" />
      <circle cx="14.6" cy="13.4" r="1.2" /><path d="M12.7 17.5c.3-1.1 1-1.7 1.9-1.7s1.6.6 1.9 1.7" />
    </svg>
  ),
  otros: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="1.6em" height="1.6em">
      <path d="M4.5 20 19 5.5" /><path d="m15 4.5 4.5.01L19.5 9" />
      <circle cx="6.5" cy="6.5" r="1.1" /><circle cx="7" cy="17" r="1.1" />
    </svg>
  ),
} as const;

const ROTACIONES = ["rotate-[-1.3deg]", "rotate-[1.1deg]", "rotate-[-0.7deg]", "rotate-[1.6deg]"];

export default function Dashboard({ ir }: { ir: (v: Vista) => void }) {
  const { db, updateActividad, deleteActividad, toast } = useStore();
  const [tick, setTick] = useState<string | null>(null);

  useEffect(() => {
    if (!tick) return;
    const t = setTimeout(() => setTick(null), 700);
    return () => clearTimeout(t);
  }, [tick]);

  const activos = db.alumnos.filter((a) => a.estado === "activo").length;
  const estabs = new Set(db.alumnos.filter((a) => a.estado !== "egresado").map((a) => a.establecimiento)).size;
  const hoyISO = format(new Date(), "yyyy-MM-dd");
  const semana = new Date();
  semana.setDate(semana.getDate() + 7);
  const proximas = db.actividades
    .filter((a) => !a.realizada && new Date(a.fecha) <= semana)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 4);

  const toggleRealizada = (id: string) => {
    const act = db.actividades.find((a) => a.id === id);
    updateActividad(id, { realizada: !act?.realizada });
    setTick(id);
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buen día" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div>
      {/* saludo de pizarrón */}
      <header className="anim-fade-up relative overflow-hidden rounded-2xl border-[6px] border-[#a8763e] bg-pizarra p-7 text-tiza shadow-tab sm:p-9">
        <div className="pizarra-texture pointer-events-none absolute inset-0" />
        {/* tizas en la repisa */}
        <div className="pointer-events-none absolute -bottom-1 left-10 hidden h-2.5 w-14 rotate-2 rounded-full bg-white/80 sm:block" />
        <div className="pointer-events-none absolute -bottom-1 left-28 hidden h-2.5 w-10 -rotate-3 rounded-full bg-lapiz/90 sm:block" />
        <div className="relative">
          <p className="font-hand text-[clamp(20px,2.6vw,26px)] text-lapiz">
            {saludo}, {db.docente.replace("Prof. ", "")} ✎
          </p>
          <h1 className="mt-1 font-display text-[clamp(1.7rem,4vw,2.9rem)] font-extrabold leading-[1.08] text-white">
            Tu aula va a donde están <span className="chalk-underline">tus alumnos</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-tiza/80">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })} — {db.docente}. Organizá las
            clases de hoy, cargá nuevos estudiantes y llevá el planificador a tu documento.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => ir("planificador")}
              className="group inline-flex items-center gap-2 rounded-lg bg-lapiz px-4 py-2.5 text-[14px] font-extrabold text-pizdark shadow-[0_3px_0_#8a6508] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 active:shadow-none"
            >
              <IcAgenda /> Planificar actividades
              <IcFlecha className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => ir("panel")}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-tiza/40 px-4 py-2.5 text-[14px] font-extrabold text-tiza transition hover:border-tiza hover:bg-white/8 active:scale-95"
            >
              Ver todos los alumnos
            </button>
          </div>
        </div>
      </header>

      {/* métricas rápidas */}
      <section className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { n: db.alumnos.length, l: "alumnos en carpeta", c: "#123f35", d: 1 },
          { n: activos, l: "activos hoy", c: "#0e7c66", d: 2 },
          { n: estabs, l: "establecimientos", c: "#2f6fb2", d: 3 },
          { n: proximas.length, l: "próximas actividades", c: "#d97e12", d: 4 },
        ].map((m) => (
          <div key={m.l} className={`ficha anim-fade-up delay-${m.d} px-5 py-4`}>
            <p className="font-display text-[clamp(1.9rem,3vw,2.5rem)] font-extrabold leading-none" style={{ color: m.c }}>
              {m.n}
            </p>
            <p className="mt-1.5 text-[12.5px] font-bold uppercase tracking-wide text-inkfaint">{m.l}</p>
          </div>
        ))}
      </section>

      {/* botones de modalidad */}
      <section className="mt-10">
        <div className="anim-fade-up flex items-end justify-between gap-3">
          <h2 className="font-display text-[clamp(1.2rem,2.4vw,1.6rem)] font-extrabold text-ink">
            Organizar por modalidad
          </h2>
          <p className="hidden font-hand text-[19px] text-inkfaint sm:block">tocá un botón para abrir su carpeta ↓</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CATEGORIAS.map((c, i) => {
            const n = db.alumnos.filter((a) => a.categoria === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => ir(c.id)}
                className={`ficha anim-fade-up delay-${i + 1} group relative flex flex-col items-start overflow-hidden p-5 text-left`}
                style={{ borderTop: `5px solid ${c.color}` }}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                  style={{ background: c.color }}
                >
                  {ICONOS[c.id]}
                </span>
                <span className="mt-4 font-display text-[17px] font-extrabold leading-tight text-ink">
                  {c.label}
                </span>
                <span className="mt-1 text-[13px] leading-snug text-inksoft">{c.descripcion}</span>
                <span className="mt-4 flex w-full items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-1 text-[12px] font-extrabold"
                    style={{ background: hexA(c.color, 0.12), color: c.color }}
                  >
                    {n} {n === 1 ? "alumno" : "alumnos"}
                  </span>
                  <span
                    className="translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    style={{ color: c.color }}
                  >
                    <IcFlecha />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* próximas actividades + exportar */}
      <section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* notas adhesivas */}
        <div>
          <div className="anim-fade-up flex items-end justify-between gap-3">
            <h2 className="font-display text-[clamp(1.2rem,2.4vw,1.6rem)] font-extrabold text-ink">
              Próximas actividades
            </h2>
            <button
              onClick={() => ir("planificador")}
              className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-hosp transition hover:gap-2.5"
            >
              Ir al planificador <IcFlecha width="1em" height="1em" />
            </button>
          </div>
          {proximas.length === 0 ? (
            <div className="ficha anim-fade-up delay-1 mt-4 px-6 py-10 text-center">
              <p className="font-hand text-[24px] text-inksoft">¡Agenda libre! 🎉</p>
              <p className="text-[13.5px] text-inkfaint">No hay actividades pendientes en los próximos 7 días.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {proximas.map((a, i) => {
                const m = catMeta(a.categoria);
                const alumnos = a.alumnoIds
                  .map((id) => db.alumnos.find((x) => x.id === id))
                  .filter(Boolean);
                const esHoy = a.fecha === hoyISO;
                return (
                  <article
                    key={a.id}
                    className={`nota anim-pop delay-${i + 1} p-4 pt-5 ${ROTACIONES[i % 4]}`}
                    style={{ background: hexA(m.color, 0.1), borderTop: `3px solid ${m.color}` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-white"
                        style={{ background: m.color }}
                      >
                        {esHoy ? <IcEstrella width="0.95em" height="0.95em" /> : <IcReloj width="0.95em" height="0.95em" />}
                        {esHoy ? "Hoy" : format(new Date(`${a.fecha}T12:00:00`), "EEE d MMM", { locale: es })}
                        {a.hora ? ` · ${a.hora}` : ""}
                      </span>
                      <button
                        onClick={() => {
                          deleteActividad(a.id);
                          toast(`Se quitó «${a.titulo}»`, "info");
                        }}
                        className="rounded p-1 text-inkfaint opacity-0 transition hover:bg-white/60 hover:text-birome group-hover:opacity-100 [.nota:hover_&]:opacity-100"
                        aria-label="Eliminar actividad"
                        title="Quitar del planificador"
                      >
                        <IcTacho width="1em" height="1em" />
                      </button>
                    </div>
                    <h3 className={`mt-2.5 font-display text-[15.5px] font-extrabold leading-snug text-ink ${a.realizada ? "line-through opacity-60" : ""}`}>
                      {a.titulo}
                    </h3>
                    <p className="mt-1 text-[12.5px] font-bold text-inksoft">
                      {a.area} · {alumnos.map((x) => x!.nombre).join(", ") || "sin destinatarios"}
                    </p>
                    <label className="mt-3 flex cursor-pointer select-none items-center gap-2 text-[12.5px] font-extrabold text-inksoft">
                      <button
                        onClick={() => toggleRealizada(a.id)}
                        className={`grid h-[22px] w-[22px] place-items-center rounded-md border-2 transition-all active:scale-90 ${
                          a.realizada ? "border-domi bg-domi text-white" : "border-ink/25 bg-white text-transparent"
                        } ${tick === a.id ? "anim-tick" : ""}`}
                        aria-label="Marcar como realizada"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12.5 4.5 4.5L19 7" />
                        </svg>
                      </button>
                      {a.realizada ? "¡Realizada! ✓" : "Marcar como realizada"}
                    </label>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* exportar a documentos */}
        <div>
          <h2 className="anim-fade-up font-display text-[clamp(1.2rem,2.4vw,1.6rem)] font-extrabold text-ink">
            Llevar a documentos
          </h2>
          <div className="anim-fade-up delay-2 mt-4 space-y-3">
            <button
              onClick={() => {
                descargarDoc(padronDoc(db), "Carpeta_Didactica_Padron");
                toast("Padrón exportado como .doc", "warn");
              }}
              className="ficha group flex w-full items-center gap-4 p-4 text-left"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-pizarra text-lapiz transition-transform group-hover:-rotate-6 group-hover:scale-110">
                <IcDoc />
              </span>
              <span className="flex-1">
                <span className="block font-display text-[15px] font-extrabold text-ink">Padrón de alumnos (.doc)</span>
                <span className="block text-[12.5px] text-inksoft">Listado completo por modalidad, listo para Word o Google Docs.</span>
              </span>
              <IcFlecha className="text-inkfaint transition group-hover:translate-x-1 group-hover:text-ink" />
            </button>

            <button
              onClick={() => {
                descargarDoc(
                  planificadorDoc(db, db.actividades, { categoria: "todas", realizadas: null }),
                  "Carpeta_Didactica_Planificador"
                );
                toast("Planificador exportado como .doc", "warn");
              }}
              className="ficha group flex w-full items-center gap-4 p-4 text-left"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-hosp text-white transition-transform group-hover:-rotate-6 group-hover:scale-110">
                <IcAgenda />
              </span>
              <span className="flex-1">
                <span className="block font-display text-[15px] font-extrabold text-ink">Planificador de actividades (.doc)</span>
                <span className="block text-[12.5px] text-inksoft">Todas las actividades agrupadas por fecha.</span>
              </span>
              <IcFlecha className="text-inkfaint transition group-hover:translate-x-1 group-hover:text-ink" />
            </button>

            <a
              href={docGoogleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ficha group flex w-full items-center gap-4 p-4 text-left"
              style={{ borderLeft: "4px solid #1a73e8" }}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-linea transition-transform group-hover:scale-110">
                <IcGoogle />
              </span>
              <span className="flex-1">
                <span className="block font-display text-[15px] font-extrabold text-ink">Abrir mi Google Doc</span>
                <span className="block text-[12.5px] text-inksoft">Tu documento de trabajo habitual, en otra pestaña.</span>
              </span>
              <IcFlecha className="text-inkfaint transition group-hover:translate-x-1 group-hover:text-ink" />
            </a>

            <p className="rounded-lg border border-dashed border-lapizdeep/50 bg-lapiz/12 px-4 py-3 text-[12.5px] font-bold leading-relaxed text-[#7a5a06]">
              💡 Los archivos <b>.doc</b> se guardan en tu computadora y se abren directamente con
              Google Docs o Word — sin configurar nada.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
