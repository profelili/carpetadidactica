import { useState, type ReactNode } from "react";
import { useStore } from "../store";
import { CATEGORIAS, type Vista } from "../types";
import {
  IcAgenda,
  IcCarpeta,
  IcDomicilio,
  IcHogar,
  IcHospital,
  IcOtros,
  IcPanel,
  IcX,
} from "../icons";

const ICONOS = {
  domiciliarios: <IcDomicilio />,
  hospitalarios: <IcHospital />,
  hogares: <IcHogar />,
  otros: <IcOtros />,
} as const;

export default function Sidebar({
  vista,
  ir,
  abierta,
  onCerrar,
}: {
  vista: Vista;
  ir: (v: Vista) => void;
  abierta: boolean;
  onCerrar: () => void;
}) {
  const { db } = useStore();
  const [docenteEdit, setDocenteEdit] = useState(false);
  const { setDocente, resetDemo, toast } = useStore();
  const [nombreDoc, setNombreDoc] = useState(db.docente);

  const contar = (c: string) => db.alumnos.filter((a) => a.categoria === c).length;
  const semana = new Date();
  semana.setDate(semana.getDate() + 7);
  const proximas = db.actividades.filter(
    (a) => !a.realizada && new Date(a.fecha) <= semana
  ).length;

  const nav = (v: Vista, label: string, icono: ReactNode, extra?: ReactNode) => {
    const activo = vista === v;
    return (
      <button
        key={v}
        onClick={() => ir(v)}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[14px] font-bold transition-all duration-200 ${
          activo
            ? "bg-lapiz text-pizdark shadow-[0_3px_0_#8a6508]"
            : "text-tiza/85 hover:translate-x-1 hover:bg-white/8 hover:text-tiza"
        }`}
      >
        <span className={`shrink-0 ${activo ? "text-pizdark" : "text-lapiz/90 group-hover:scale-110"}`}>
          {icono}
        </span>
        <span className="flex-1">{label}</span>
        {extra}
      </button>
    );
  };

  const contador = (n: number, color?: string) => (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
        color ? "text-white" : "bg-white/12 text-tiza/80"
      }`}
      style={color ? { background: color } : undefined}
    >
      {n}
    </span>
  );

  const contenido = (
    <div className="pizarra-texture flex h-full flex-col overflow-y-auto bg-pizarra text-tiza">
      {/* marca */}
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="anim-wiggle grid h-11 w-11 place-items-center rounded-lg bg-lapiz text-pizdark shadow-[0_3px_0_#8a6508]">
              <IcCarpeta width="1.5em" height="1.5em" />
            </span>
            <div>
              <p className="font-display text-[19px] font-extrabold leading-none text-white">
                Carpeta Didáctica
              </p>
              <p className="mt-1 font-hand text-[16px] leading-none text-lapiz">
                cuaderno de la docente
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-md p-1 text-tiza/60 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <IcX />
          </button>
        </div>
      </div>

      {/* navegación */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        {nav("dashboard", "Panel de control", <IcPanel />)}
        <p className="px-3.5 pb-1.5 pt-4 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-tiza/45">
          Alumnos por modalidad
        </p>
        {CATEGORIAS.map((c) =>
          nav(c.id, c.label, ICONOS[c.id], contador(contar(c.id), c.color))
        )}
        <p className="px-3.5 pb-1.5 pt-4 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-tiza/45">
          Gestión
        </p>
        {nav("panel", "Panel de alumnos", <IcPanel />, contador(db.alumnos.length))}
        {nav(
          "planificador",
          "Planificador",
          <IcAgenda />,
          proximas > 0 ? contador(proximas, "#2f6fb2") : undefined
        )}
      </nav>

      {/* pie: docente + datos demo */}
      <div className="space-y-3 border-t border-white/10 p-4">
        {docenteEdit ? (
          <div className="flex gap-1.5">
            <input
              autoFocus
              value={nombreDoc}
              onChange={(e) => setNombreDoc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setDocente(nombreDoc);
                  setDocenteEdit(false);
                }
              }}
              className="w-full rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-[13px] font-bold text-white outline-none placeholder:text-white/40 focus:border-lapiz"
              placeholder="Tu nombre"
            />
            <button
              onClick={() => {
                setDocente(nombreDoc);
                setDocenteEdit(false);
                toast("Nombre de docente actualizado");
              }}
              className="rounded-md bg-lapiz px-2.5 text-[12px] font-extrabold text-pizdark transition hover:brightness-105 active:scale-95"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setNombreDoc(db.docente);
              setDocenteEdit(true);
            }}
            className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/8"
            title="Cambiar nombre de docente"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/12 font-display text-[13px] font-extrabold text-lapiz">
              {db.docente
                .replace("Prof. ", "")
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-extrabold text-white">
                {db.docente}
              </span>
              <span className="block font-hand text-[14px] leading-tight text-tiza/55 group-hover:text-lapiz">
                tocá para cambiar el nombre
              </span>
            </span>
          </button>
        )}
        <button
          onClick={() => {
            resetDemo();
            toast("Datos de ejemplo restaurados", "info");
          }}
          className="w-full rounded-md border border-dashed border-white/25 px-3 py-1.5 text-[11.5px] font-bold text-tiza/60 transition hover:border-lapiz/60 hover:text-lapiz active:scale-95"
        >
          Restaurar datos de ejemplo
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* escritorio: fijo */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[286px] shadow-tab lg:block">
        {contenido}
      </aside>
      {/* móvil: cajón */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${abierta ? "" : "pointer-events-none"}`}
        aria-hidden={!abierta}
      >
        <div
          className={`absolute inset-0 bg-pizdark/60 transition-opacity duration-300 ${
            abierta ? "opacity-100" : "opacity-0"
          }`}
          onClick={onCerrar}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[290px] shadow-2xl transition-transform duration-300 ease-out ${
            abierta ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {contenido}
        </div>
      </div>
      {/* margen para el sidebar fijo */}
      <div className="w-[286px] shrink-0 max-lg:hidden" />
    </>
  );
}
