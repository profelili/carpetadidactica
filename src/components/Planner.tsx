import { useMemo, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useStore } from "../store";
import type { Actividad, Categoria } from "../types";
import { AREAS, catMeta, hexA, hoyISO, iniciales } from "../types";
import { descargarDoc, planificadorDoc } from "../docExport";
import { BtnPri, BtnSec, Campo, Chip, Confirmar, Modal, Vacio } from "./ui";
import {
  IcAgenda,
  IcCheck,
  IcDescargar,
  IcGoogle,
  IcLapiz,
  IcMas,
  IcReloj,
  IcTacho,
  IcUsuarios,
} from "../icons";

export default function Planner() {
  const { db, addActividad, updateActividad, deleteActividad, toast } = useStore();
  const [fCat, setFCat] = useState<Categoria | "todas">("todas");
  const [fEstado, setFEstado] = useState<"pendientes" | "realizadas" | "todas">("pendientes");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Actividad | null>(null);
  const [borrar, setBorrar] = useState<Actividad | null>(null);

  const filtradas = useMemo(
    () =>
      db.actividades
        .filter((a) => (fCat === "todas" ? true : a.categoria === fCat))
        .filter((a) =>
          fEstado === "todas" ? true : fEstado === "realizadas" ? a.realizada : !a.realizada
        )
        .sort((a, b) => (a.fecha + (a.hora ?? "")).localeCompare(b.fecha + (b.hora ?? ""))),
    [db.actividades, fCat, fEstado]
  );

  const grupos = useMemo(() => {
    const m = new Map<string, Actividad[]>();
    for (const a of filtradas) {
      const arr = m.get(a.fecha) ?? [];
      arr.push(a);
      m.set(a.fecha, arr);
    }
    return [...m.entries()];
  }, [filtradas]);

  const exportar = () => {
    descargarDoc(
      planificadorDoc(db, filtradas, {
        categoria: fCat,
        realizadas: fEstado === "todas" ? null : fEstado === "realizadas",
      }),
      `Carpeta_Didactica_Planificador_${hoyISO()}`
    );
    toast("Planificador guardado como archivo .doc", "warn");
  };

  return (
    <div>
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-hosp">
            <span className="h-[2px] w-8 rounded bg-hosp" />
            Planificación
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-extrabold leading-tight text-ink">
            Planificador de actividades
          </h1>
          <p className="mt-1 max-w-xl text-[14.5px] text-inksoft">
            Armá la agenda de clases y, cuando quieras, guardala en un archivo de Word o Google Docs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BtnSec onClick={exportar}>
            <IcDescargar /> Guardar planificador (.doc)
          </BtnSec>
          <BtnPri onClick={() => { setEditando(null); setFormAbierto(true); }}>
            <IcMas /> Nueva actividad
          </BtnPri>
        </div>
      </header>

      {/* filtros */}
      <div className="anim-fade-up delay-1 mt-6 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {(["todas", "domiciliarios", "hospitalarios", "hogares", "otros"] as const).map((c) => {
            const m = c === "todas" ? null : catMeta(c);
            const sel = fCat === c;
            return (
              <button
                key={c}
                onClick={() => setFCat(c)}
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-[12px] font-extrabold transition active:scale-95 ${
                  sel ? "text-white" : "border-linea bg-white text-inksoft hover:border-ink/25"
                }`}
                style={sel ? { background: m?.color ?? "#123f35", borderColor: m?.color ?? "#123f35" } : undefined}
              >
                {c === "todas" ? "Todas las modalidades" : m!.corto}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex gap-1.5">
          {(["pendientes", "realizadas", "todas"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setFEstado(e)}
              className={`rounded-full border-[1.5px] px-3 py-1.5 text-[12px] font-extrabold capitalize transition active:scale-95 ${
                fEstado === e
                  ? "border-pizarra bg-pizarra text-lapiz"
                  : "border-linea bg-white text-inksoft hover:border-ink/25"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* cronograma */}
      {grupos.length === 0 ? (
        <div className="mt-8">
          <Vacio
            titulo="Agenda vacía"
            texto="No hay actividades para los filtros elegidos. Creá una nueva o cambiá el filtro."
            accion={<BtnPri onClick={() => { setEditando(null); setFormAbierto(true); }}><IcMas /> Nueva actividad</BtnPri>}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-7">
          {grupos.map(([fecha, acts], gi) => {
            const d = new Date(`${fecha}T12:00:00`);
            const esHoy = fecha === hoyISO();
            return (
              <section key={fecha} className="anim-fade-up" style={{ animationDelay: `${gi * 0.06}s` }}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-sm ${esHoy ? "bg-birome" : "bg-pizarra"}`}>
                    <span className="font-display text-[19px] font-extrabold leading-none">{d.getDate()}</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-90">
                      {format(d, "MMM", { locale: es })}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-[16px] font-extrabold capitalize leading-tight text-ink">
                      {format(d, "EEEE", { locale: es })}
                      {esHoy && <span className="ml-2 rounded-full bg-birome/12 px-2 py-0.5 text-[11px] font-extrabold uppercase text-birome">hoy</span>}
                    </h2>
                    <p className="text-[12.5px] font-bold text-inkfaint">
                      {acts.length} {acts.length === 1 ? "actividad" : "actividades"} ·{" "}
                      {acts.filter((a) => a.realizada).length} realizada(s)
                    </p>
                  </div>
                </div>

                <div className="ml-4 space-y-3 border-l-2 border-dashed border-linea pl-6 pt-3 sm:ml-7">
                  {acts.map((a) => (
                    <ActividadCard
                      key={a.id}
                      actividad={a}
                      onEditar={() => { setEditando(a); setFormAbierto(true); }}
                      onBorrar={() => setBorrar(a)}
                      onToggle={() => {
                        updateActividad(a.id, { realizada: !a.realizada });
                        toast(a.realizada ? "Vuelve a pendientes" : "¡Actividad realizada! ✓");
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <FormActividad
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        actividad={editando}
        onGuardar={(datos) => {
          if (editando) {
            updateActividad(editando.id, datos);
            toast("Actividad actualizada");
          } else {
            addActividad(datos);
            toast("Actividad agregada al planificador");
          }
          setFormAbierto(false);
        }}
      />

      <Confirmar
        abierto={!!borrar}
        onCerrar={() => setBorrar(null)}
        titulo="Eliminar actividad"
        mensaje={
          <>
            ¿Querés eliminar <b className="text-ink">«{borrar?.titulo}»</b> del planificador?
          </>
        }
        onConfirmar={() => {
          if (borrar) {
            deleteActividad(borrar.id);
            toast("Actividad eliminada", "info");
          }
        }}
      />
    </div>
  );
}

/* ---------------- tarjeta de actividad ---------------- */

function ActividadCard({
  actividad: a,
  onEditar,
  onBorrar,
  onToggle,
}: {
  actividad: Actividad;
  onEditar: () => void;
  onBorrar: () => void;
  onToggle: () => void;
}) {
  const { db } = useStore();
  const m = catMeta(a.categoria);
  const alumnos = a.alumnoIds.map((id) => db.alumnos.find((x) => x.id === id)).filter(Boolean);

  return (
    <article
      className={`ficha group relative overflow-hidden rounded-xl transition ${
        a.realizada ? "opacity-75" : ""
      }`}
      style={{ borderLeft: `5px solid ${m.color}` }}
    >
      <div className="flex flex-wrap items-start gap-3 p-4">
        <button
          onClick={onToggle}
          aria-label={a.realizada ? "Marcar como pendiente" : "Marcar como realizada"}
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-all active:scale-90 ${
            a.realizada ? "border-domi bg-domi text-white" : "border-ink/25 bg-white text-transparent hover:border-domi"
          }`}
        >
          <IcCheck width="0.9em" height="0.9em" />
        </button>

        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-display text-[15.5px] font-extrabold text-ink ${a.realizada ? "line-through" : ""}`}>
              {a.titulo}
            </h3>
            <Chip color={m.color}>{m.corto}</Chip>
            <span className="rounded-full bg-paper px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-inksoft">
              {a.area}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-bold text-inksoft">
            {a.hora && (
              <span className="inline-flex items-center gap-1"><IcReloj width="1em" height="1em" className="text-inkfaint" /> {a.hora}</span>
            )}
            {a.duracion && <span>⏱ {a.duracion}</span>}
            <span className="inline-flex items-center gap-1">
              <IcUsuarios width="1em" height="1em" className="text-inkfaint" />
              {alumnos.length ? alumnos.map((x) => x!.nombre).join(", ") : "sin destinatarios"}
            </span>
          </div>
          {a.objetivo && (
            <p className="mt-2 text-[13px] leading-relaxed text-inksoft">
              <b className="text-ink">Objetivo:</b> {a.objetivo}
            </p>
          )}
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink/80">
            <b className="text-ink">Consignas:</b>{" "}
            <span className="whitespace-pre-line">{a.consignas}</span>
          </p>
          {a.recursos && (
            <p className="mt-1.5 text-[12.5px] font-bold text-inksoft">
              <b className="text-ink">Recursos:</b> {a.recursos}
            </p>
          )}
          {alumnos.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {alumnos.map((x) => {
                const cm = catMeta(x!.categoria);
                return (
                  <span
                    key={x!.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-linea bg-white px-2 py-1 text-[11.5px] font-extrabold text-ink transition group-hover:border-transparent"
                    style={{ boxShadow: `inset 0 -2px 0 ${cm.color}` }}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full text-[9.5px] text-white" style={{ background: cm.color }}>
                      {iniciales(x!)}
                    </span>
                    {x!.nombre} {x!.apellido}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button onClick={onEditar} className="rounded-md p-1.5 text-hosp transition hover:bg-hosp/12 active:scale-90" aria-label="Editar" title="Editar">
            <IcLapiz />
          </button>
          <button onClick={onBorrar} className="rounded-md p-1.5 text-birome transition hover:bg-birome/12 active:scale-90" aria-label="Eliminar" title="Eliminar">
            <IcTacho />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------- formulario ---------------- */

const vacioAct: Omit<Actividad, "id"> = {
  titulo: "",
  fecha: hoyISO(),
  hora: "",
  categoria: "domiciliarios",
  alumnoIds: [],
  area: AREAS[0],
  duracion: "",
  objetivo: "",
  consignas: "",
  recursos: "",
  realizada: false,
};

function FormActividad({
  abierto,
  onCerrar,
  actividad,
  onGuardar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  actividad: Actividad | null;
  onGuardar: (a: Omit<Actividad, "id">) => void;
}) {
  const { db } = useStore();
  const [f, setF] = useState<Omit<Actividad, "id">>(vacioAct);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [abiertoPrev, setAbiertoPrev] = useState(false);

  if (abierto !== abiertoPrev) {
    setAbiertoPrev(abierto);
    if (abierto) {
      setErrores({});
      setF(actividad ? { ...actividad } : { ...vacioAct });
    }
  }

  const set = <K extends keyof Omit<Actividad, "id">>(k: K, v: Omit<Actividad, "id">[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const candidatos = db.alumnos.filter(
    (a) => a.estado !== "egresado" && (f.categoria === a.categoria || a.categoria === "otros")
  );

  const toggleAlumno = (id: string) =>
    set(
      "alumnoIds",
      f.alumnoIds.includes(id) ? f.alumnoIds.filter((x) => x !== id) : [...f.alumnoIds, id]
    );

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.titulo.trim()) errs.titulo = "Poné un título.";
    if (!f.consignas.trim()) errs.consignas = "Describí las consignas.";
    if (!f.fecha) errs.fecha = "Elegí una fecha.";
    setErrores(errs);
    if (Object.keys(errs).length) return;
    onGuardar({ ...f, titulo: f.titulo.trim() });
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={actividad ? "Editar actividad" : "Nueva actividad"}
      sub="Quedará en el planificador y podrá exportarse al documento."
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo label="Título" req error={errores.titulo}>
          <input className="input-base" value={f.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ej.: Fracciones con receta de bizcochuelo" />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo label="Fecha" req error={errores.fecha}>
            <input type="date" className="input-base" value={f.fecha} onChange={(e) => set("fecha", e.target.value)} />
          </Campo>
          <Campo label="Hora">
            <input type="time" className="input-base" value={f.hora} onChange={(e) => set("hora", e.target.value)} />
          </Campo>
          <Campo label="Duración">
            <input className="input-base" value={f.duracion} onChange={(e) => set("duracion", e.target.value)} placeholder="Ej.: 45 min" />
          </Campo>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Modalidad" req>
            <select
              className="input-base"
              value={f.categoria}
              onChange={(e) => {
                const cat = e.target.value as Categoria;
                setF((p) => ({
                  ...p,
                  categoria: cat,
                  alumnoIds: p.alumnoIds.filter((id) => {
                    const al = db.alumnos.find((x) => x.id === id);
                    return al && (al.categoria === cat || al.categoria === "otros");
                  }),
                }));
              }}
            >
              {(["domiciliarios", "hospitalarios", "hogares", "otros"] as Categoria[]).map((c) => (
                <option key={c} value={c}>{catMeta(c).label}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Área / materia">
            <select className="input-base" value={f.area} onChange={(e) => set("area", e.target.value)}>
              {AREAS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </Campo>
        </div>

        <Campo label={`Alumnos destinatarios (${f.alumnoIds.length} seleccionados)`}>
          {candidatos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-linea bg-paper px-3 py-3 text-[13px] font-bold text-inkfaint">
              No hay alumnos activos de esta modalidad. Cargalos primero desde el panel.
            </p>
          ) : (
            <div className="grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-linea bg-paper/60 p-2 sm:grid-cols-3">
              {candidatos.map((a) => {
                const sel = f.alumnoIds.includes(a.id);
                const cm = catMeta(a.categoria);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAlumno(a.id)}
                    className={`flex items-center gap-2 rounded-lg border-[1.5px] px-2 py-1.5 text-left text-[12px] font-extrabold transition active:scale-95 ${
                      sel ? "bg-white text-ink" : "border-linea bg-white/60 text-inksoft hover:border-ink/25"
                    }`}
                    style={sel ? { borderColor: cm.color, boxShadow: `inset 0 -2.5px 0 ${cm.color}` } : undefined}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] text-white" style={{ background: cm.color }}>
                      {iniciales(a)}
                    </span>
                    <span className="truncate">{a.nombre} {a.apellido}</span>
                    {sel && <IcCheck width="0.85em" height="0.85em" className="ml-auto shrink-0" style={{ color: cm.color }} />}
                  </button>
                );
              })}
            </div>
          )}
        </Campo>

        <Campo label="Objetivo">
          <input className="input-base" value={f.objetivo} onChange={(e) => set("objetivo", e.target.value)} placeholder="¿Qué querés lograr en esta clase?" />
        </Campo>
        <Campo label="Consignas / desarrollo" req error={errores.consignas}>
          <textarea
            className="input-base min-h-[110px] resize-y"
            value={f.consignas}
            onChange={(e) => set("consignas", e.target.value)}
            placeholder={"1) …\n2) …\n3) …"}
          />
        </Campo>
        <Campo label="Recursos">
          <input className="input-base" value={f.recursos} onChange={(e) => set("recursos", e.target.value)} placeholder="Ej.: afiches, fibrones, cuaderno de ciencias" />
        </Campo>

        <div className="flex justify-end gap-2 border-t border-linea pt-4">
          <BtnSec onClick={onCerrar}>Cancelar</BtnSec>
          <BtnPri type="submit">
            <IcAgenda /> {actividad ? "Guardar cambios" : "Agregar al planificador"}
          </BtnPri>
        </div>
      </form>
    </Modal>
  );
}
