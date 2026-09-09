import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useStore } from "../store";
import type { Alumno, Categoria, EstadoAlumno } from "../types";
import { CATEGORIAS, catMeta, GRADOS, hoyISO, iniciales } from "../types";
import { descargarDoc, padronDoc } from "../docExport";
import { BtnPri, BtnSec, Campo, Chip, Confirmar, Modal, Vacio } from "./ui";
import {
  IcBuscar,
  IcDescargar,
  IcEscuela,
  IcLapiz,
  IcMas,
  IcSubir,
  IcTacho,
  IcUsuarios,
} from "../icons";

const ESTADO_STYLE: Record<EstadoAlumno, string> = {
  activo: "bg-domi/12 text-domi",
  pausado: "bg-hogar/15 text-hogar",
  egresado: "bg-linea/70 text-inksoft",
};

const vacio: Omit<Alumno, "id"> = {
  nombre: "",
  apellido: "",
  dni: "",
  categoria: "domiciliarios",
  escuelaOrigen: "",
  grado: GRADOS[3],
  establecimiento: "",
  tutor: "",
  estado: "activo",
  fechaAlta: hoyISO(),
  diagnostico: "",
  observaciones: "",
};

export default function StudentsView({ categoria }: { categoria: Categoria | "todos" }) {
  const { db, addAlumno, updateAlumno, deleteAlumno, importarDB, toast } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busqueda, setBusqueda] = useState("");
  const [fEst, setFEst] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Alumno | null>(null);
  const [borrar, setBorrar] = useState<Alumno | null>(null);

  const meta = categoria === "todos" ? null : catMeta(categoria);
  const esPanel = categoria === "todos";

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return db.alumnos
      .filter((a) => (categoria === "todos" ? true : a.categoria === categoria))
      .filter((a) => (fEst ? a.establecimiento === fEst : true))
      .filter((a) => (fEstado ? a.estado === fEstado : true))
      .filter(
        (a) =>
          !q ||
          `${a.nombre} ${a.apellido} ${a.dni ?? ""} ${a.escuelaOrigen} ${a.establecimiento}`
            .toLowerCase()
            .includes(q)
      )
      .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`));
  }, [db.alumnos, categoria, busqueda, fEst, fEstado]);

  const establecimientos = useMemo(
    () =>
      [
        ...new Set(
          db.alumnos
            .filter((a) => (categoria === "todos" ? true : a.categoria === categoria))
            .map((a) => a.establecimiento)
        ),
      ].sort(),
    [db.alumnos, categoria]
  );

  const abrirNuevo = () => {
    setEditando(null);
    setFormAbierto(true);
  };
  const abrirEditar = (a: Alumno) => {
    setEditando(a);
    setFormAbierto(true);
  };

  const exportarRespaldo = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { app: "Carpeta Didáctica", exportadoEl: new Date().toISOString(), ...db },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `carpeta-didactica-respaldo-${hoyISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Respaldo JSON descargado");
  };

  const importarRespaldo = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importarDB(JSON.parse(String(reader.result)));
      } catch {
        toast("No se pudo leer el archivo JSON", "warn");
      }
    };
    reader.readAsText(f);
  };

  return (
    <div>
      {/* encabezado de sección */}
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.2em]"
            style={{ color: meta?.color ?? "#123f35" }}
          >
            <span className="h-[2px] w-8 rounded" style={{ background: meta?.color ?? "#123f35" }} />
            {esPanel ? "Gestión" : "Modalidad"}
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-extrabold leading-tight text-ink">
            {esPanel ? "Panel de alumnos" : meta!.label}
          </h1>
          <p className="mt-1 max-w-xl text-[14.5px] text-inksoft">
            {esPanel
              ? "Todas las fichas de tus establecimientos, con buscador y filtros."
              : meta!.descripcion}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BtnSec
            onClick={() => {
              descargarDoc(padronDoc(db), "Carpeta_Didactica_Padron");
              toast("Padrón exportado como .doc", "warn");
            }}
          >
            <IcDescargar /> Padrón .doc
          </BtnSec>
          <BtnSec onClick={exportarRespaldo} title="Descargar copia de seguridad (JSON)">
            <IcDescargar /> Respaldo
          </BtnSec>
          <BtnSec onClick={() => fileRef.current?.click()} title="Restaurar desde un respaldo JSON">
            <IcSubir /> Restaurar
          </BtnSec>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={importarRespaldo}
          />
          <BtnPri onClick={abrirNuevo}>
            <IcMas /> Nueva ficha
          </BtnPri>
        </div>
      </header>

      {/* barra de herramientas */}
      <div className="anim-fade-up delay-1 mt-6 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <IcBuscar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inkfaint" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DNI o escuela…"
            className="input-base pl-9"
          />
        </div>
        <select value={fEst} onChange={(e) => setFEst(e.target.value)} className="input-base w-auto">
          <option value="">Todos los establecimientos</option>
          {establecimientos.map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
        <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} className="input-base w-auto">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="pausado">Pausados</option>
          <option value="egresado">Egresados</option>
        </select>
        <span className="ml-auto rounded-full bg-pizarra px-3 py-1.5 text-[12px] font-extrabold text-lapiz">
          {lista.length} {lista.length === 1 ? "ficha" : "fichas"}
        </span>
      </div>

      {/* contenido */}
      {lista.length === 0 ? (
        <div className="mt-8">
          <Vacio
            titulo={busqueda || fEst || fEstado ? "Nada por aquí…" : "Todavía no hay fichas"}
            texto={
              busqueda || fEst || fEstado
                ? "Probá con otra búsqueda o quitá algún filtro."
                : "Cargá tu primer alumno de esta modalidad con el botón «Nueva ficha»."
            }
            accion={
              busqueda || fEst || fEstado ? (
                <BtnSec onClick={() => { setBusqueda(""); setFEst(""); setFEstado(""); }}>
                  Limpiar filtros
                </BtnSec>
              ) : (
                <BtnPri onClick={abrirNuevo}><IcMas /> Nueva ficha</BtnPri>
              )
            }
          />
        </div>
      ) : esPanel ? (
        <TablaAlumnos lista={lista} onEditar={abrirEditar} onBorrar={setBorrar} />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((a, i) => (
            <FichaAlumno
              key={a.id}
              alumno={a}
              delay={i % 6}
              onEditar={() => abrirEditar(a)}
              onBorrar={() => setBorrar(a)}
            />
          ))}
        </div>
      )}

      <FormAlumno
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        alumno={editando}
        catInicial={categoria === "todos" ? "domiciliarios" : categoria}
        onGuardar={(datos) => {
          if (editando) {
            updateAlumno(editando.id, datos);
            toast(`Ficha de ${datos.nombre} actualizada`);
          } else {
            addAlumno(datos);
            toast(`${datos.nombre} ${datos.apellido} agregado a la carpeta`);
          }
          setFormAbierto(false);
        }}
      />

      <Confirmar
        abierto={!!borrar}
        onCerrar={() => setBorrar(null)}
        titulo="Eliminar ficha de alumno"
        mensaje={
          <>
            ¿Seguro que querés eliminar la ficha de{" "}
            <b className="text-ink">{borrar ? `${borrar.nombre} ${borrar.apellido}` : ""}</b>? También se
            quitará de las actividades donde figure. Esta acción no se puede deshacer.
          </>
        }
        onConfirmar={() => {
          if (borrar) {
            deleteAlumno(borrar.id);
            toast(`Ficha de ${borrar.nombre} eliminada`, "info");
          }
        }}
      />
    </div>
  );
}

/* ---------------- ficha (tarjeta) ---------------- */

function FichaAlumno({
  alumno: a,
  onEditar,
  onBorrar,
  delay,
}: {
  alumno: Alumno;
  onEditar: () => void;
  onBorrar: () => void;
  delay: number;
}) {
  const meta = catMeta(a.categoria);
  return (
    <article
      className={`ficha anim-fade-up delay-${(delay % 5) + 1} group relative flex flex-col overflow-hidden rounded-xl`}
      style={{ borderTop: `5px solid ${meta.color}` }}
    >
      <div className="flex items-start gap-3 p-5 pb-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-[15px] font-extrabold text-white shadow-sm"
          style={{ background: meta.color }}
        >
          {iniciales(a)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[17px] font-extrabold text-ink">
            {a.nombre} {a.apellido}
          </h3>
          <p className="text-[12.5px] font-bold text-inksoft">
            {a.grado} {a.dni && <span className="text-inkfaint">· DNI {a.dni}</span>}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold capitalize ${ESTADO_STYLE[a.estado]}`}>
          {a.estado}
        </span>
      </div>

      <div className="ruled mx-5 flex-1 space-y-2 border-t border-linea/70 py-3 text-[13px]">
        <p className="flex items-center gap-2 text-inksoft">
          <IcEscuela width="1.05em" height="1.05em" className="shrink-0 text-inkfaint" />
          <span className="truncate"><b className="font-extrabold text-ink">Origen:</b> {a.escuelaOrigen}</span>
        </p>
        <p className="flex items-center gap-2 text-inksoft">
          <span className="grid w-[1.05em] shrink-0 place-items-center text-inkfaint">
            <svg viewBox="0 0 24 24" width="1.05em" height="1.05em" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
              <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" />
            </svg>
          </span>
          <span className="truncate">{a.establecimiento}</span>
        </p>
        {a.tutor && (
          <p className="flex items-center gap-2 text-inksoft">
            <IcUsuarios width="1.05em" height="1.05em" className="shrink-0 text-inkfaint" />
            <span className="truncate">{a.tutor}</span>
          </p>
        )}
        {a.observaciones && (
          <p className="line-clamp-2 pt-1 font-hand text-[17px] leading-snug text-ink/80">
            “{a.observaciones}”
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-linea bg-paper/60 px-5 py-2.5">
        <Chip color={meta.color}>{meta.corto}</Chip>
        <div className="flex items-center gap-3 text-[11.5px] font-bold text-inkfaint">
          Alta {format(new Date(`${a.fechaAlta}T12:00:00`), "d MMM", { locale: es })}
          <span className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={onEditar}
              className="rounded-md p-1.5 text-hosp transition hover:bg-hosp/12 active:scale-90"
              aria-label="Editar ficha"
              title="Editar"
            >
              <IcLapiz />
            </button>
            <button
              onClick={onBorrar}
              className="rounded-md p-1.5 text-birome transition hover:bg-birome/12 active:scale-90"
              aria-label="Eliminar ficha"
              title="Eliminar"
            >
              <IcTacho />
            </button>
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------------- tabla (panel) ---------------- */

function TablaAlumnos({
  lista,
  onEditar,
  onBorrar,
}: {
  lista: Alumno[];
  onEditar: (a: Alumno) => void;
  onBorrar: (a: Alumno) => void;
}) {
  return (
    <div className="anim-fade-up delay-2 mt-6 overflow-hidden rounded-xl border border-linea bg-hoja shadow-ficha">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[13.5px]">
          <thead>
            <tr className="bg-pizarra text-[11px] uppercase tracking-[0.12em] text-tiza/90">
              <th className="px-4 py-3 font-extrabold">Alumno</th>
              <th className="px-4 py-3 font-extrabold">Modalidad</th>
              <th className="px-4 py-3 font-extrabold">Escuela de origen</th>
              <th className="px-4 py-3 font-extrabold">Establecimiento actual</th>
              <th className="px-4 py-3 font-extrabold">Estado</th>
              <th className="px-4 py-3 font-extrabold">Alta</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {lista.map((a, i) => {
              const meta = catMeta(a.categoria);
              return (
                <tr
                  key={a.id}
                  onClick={() => onEditar(a)}
                  className={`cursor-pointer transition hover:bg-lapiz/10 ${i > 0 ? "border-t border-linea" : ""} ${i % 2 === 1 ? "bg-paper/50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-[12px] font-extrabold text-white"
                        style={{ background: meta.color }}
                      >
                        {iniciales(a)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-ink">{a.nombre} {a.apellido}</p>
                        <p className="text-[11.5px] text-inkfaint">{a.grado}{a.dni ? ` · DNI ${a.dni}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Chip color={meta.color}>{meta.corto}</Chip></td>
                  <td className="max-w-[190px] truncate px-4 py-3 text-inksoft">{a.escuelaOrigen}</td>
                  <td className="max-w-[190px] truncate px-4 py-3 text-inksoft">{a.establecimiento}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold capitalize ${ESTADO_STYLE[a.estado]}`}>
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-inksoft">
                    {format(new Date(`${a.fechaAlta}T12:00:00`), "d MMM yy", { locale: es })}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEditar(a)}
                        className="rounded-md p-1.5 text-hosp transition hover:bg-hosp/12 active:scale-90"
                        aria-label="Editar"
                      >
                        <IcLapiz />
                      </button>
                      <button
                        onClick={() => onBorrar(a)}
                        className="rounded-md p-1.5 text-birome transition hover:bg-birome/12 active:scale-90"
                        aria-label="Eliminar"
                      >
                        <IcTacho />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- formulario ---------------- */

function FormAlumno({
  abierto,
  onCerrar,
  alumno,
  catInicial,
  onGuardar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  alumno: Alumno | null;
  catInicial: Categoria;
  onGuardar: (a: Omit<Alumno, "id">) => void;
}) {
  const [f, setF] = useState<Omit<Alumno, "id">>(vacio);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [abiertoPrev, setAbiertoPrev] = useState(false);

  if (abierto !== abiertoPrev) {
    setAbiertoPrev(abierto);
    if (abierto) {
      setErrores({});
      setF(alumno ? { ...alumno } : { ...vacio, categoria: catInicial });
    }
  }

  const set = <K extends keyof Omit<Alumno, "id">>(k: K, v: Omit<Alumno, "id">[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.nombre.trim()) errs.nombre = "Ingresá el nombre.";
    if (!f.apellido.trim()) errs.apellido = "Ingresá el apellido.";
    if (!f.escuelaOrigen.trim()) errs.escuelaOrigen = "¿De qué escuela viene?";
    if (!f.establecimiento.trim()) errs.establecimiento = "¿Dónde recibe las clases hoy?";
    setErrores(errs);
    if (Object.keys(errs).length) return;
    onGuardar({ ...f, nombre: f.nombre.trim(), apellido: f.apellido.trim() });
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={alumno ? `Editar ficha: ${alumno.nombre} ${alumno.apellido}` : "Nueva ficha de alumno"}
      sub="Los datos se guardan automáticamente en tu carpeta."
    >
      <form onSubmit={enviar} className="space-y-4">
        <Campo label="Modalidad" req>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set("categoria", c.id)}
                className={`rounded-lg border-[1.5px] px-2 py-2 text-[12px] font-extrabold transition active:scale-95 ${
                  f.categoria === c.id ? "text-white shadow-sm" : "border-linea bg-white text-inksoft hover:border-ink/25"
                }`}
                style={f.categoria === c.id ? { background: c.color, borderColor: c.color } : undefined}
              >
                {c.corto}
              </button>
            ))}
          </div>
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre" req error={errores.nombre}>
            <input className="input-base" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej.: Valentina" />
          </Campo>
          <Campo label="Apellido" req error={errores.apellido}>
            <input className="input-base" value={f.apellido} onChange={(e) => set("apellido", e.target.value)} placeholder="Ej.: Ríos" />
          </Campo>
          <Campo label="DNI (opcional)">
            <input className="input-base" value={f.dni} onChange={(e) => set("dni", e.target.value)} placeholder="54.318.220" />
          </Campo>
          <Campo label="Grado / Año">
            <select className="input-base" value={f.grado} onChange={(e) => set("grado", e.target.value)}>
              {GRADOS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Campo>
          <Campo label="Escuela de origen" req error={errores.escuelaOrigen}>
            <input className="input-base" value={f.escuelaOrigen} onChange={(e) => set("escuelaOrigen", e.target.value)} placeholder="Ej.: Esc. Primaria N.º 12" />
          </Campo>
          <Campo label="Establecimiento actual" req error={errores.establecimiento}>
            <input className="input-base" value={f.establecimiento} onChange={(e) => set("establecimiento", e.target.value)} placeholder="Ej.: Hospital de Niños — Sala 4" />
          </Campo>
          <Campo label="Adulto referente / tutor">
            <input className="input-base" value={f.tutor} onChange={(e) => set("tutor", e.target.value)} placeholder="Ej.: Marina Ríos (mamá)" />
          </Campo>
          <Campo label="Fecha de alta">
            <input type="date" className="input-base" value={f.fechaAlta} onChange={(e) => set("fechaAlta", e.target.value)} />
          </Campo>
          <Campo label="Estado">
            <div className="grid grid-cols-3 gap-2">
              {(["activo", "pausado", "egresado"] as EstadoAlumno[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("estado", s)}
                  className={`rounded-lg border-[1.5px] px-2 py-2 text-[12px] font-extrabold capitalize transition active:scale-95 ${
                    f.estado === s
                      ? s === "activo"
                        ? "border-domi bg-domi/12 text-domi"
                        : s === "pausado"
                          ? "border-hogar bg-hogar/12 text-hogar"
                          : "border-inksoft bg-linea/60 text-inksoft"
                      : "border-linea bg-white text-inkfaint hover:border-ink/25"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Campo>
        </div>

        <Campo label="Diagnóstico / motivo de la modalidad">
          <input className="input-base" value={f.diagnostico} onChange={(e) => set("diagnostico", e.target.value)} placeholder="Ej.: reposo postoperatorio 60 días" />
        </Campo>
        <Campo label="Observaciones pedagógicas">
          <textarea
            className="input-base min-h-[80px] resize-y"
            value={f.observaciones}
            onChange={(e) => set("observaciones", e.target.value)}
            placeholder="Ritmo de trabajo, intereses, acuerdos con la escuela de origen…"
          />
        </Campo>

        <div className="flex justify-end gap-2 border-t border-linea pt-4">
          <BtnSec onClick={onCerrar}>Cancelar</BtnSec>
          <BtnPri type="submit">
            <IcLapiz /> {alumno ? "Guardar cambios" : "Agregar a la carpeta"}
          </BtnPri>
        </div>
      </form>
    </Modal>
  );
}
