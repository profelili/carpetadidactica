import { useEffect, type ReactNode } from "react";
import { useStore } from "../store";
import { IcAlerta, IcCheck, IcInfo, IcX } from "../icons";

/* ---------------- Modal ---------------- */

export function Modal({
  abierto,
  onCerrar,
  titulo,
  sub,
  children,
  ancho = "max-w-2xl",
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  sub?: string;
  children: ReactNode;
  ancho?: string;
}) {
  useEffect(() => {
    if (!abierto) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-pizdark/55 backdrop-blur-[2px]" onClick={onCerrar} />
      <div
        className={`anim-pop relative z-10 my-6 w-full ${ancho} rounded-xl border border-linea bg-hoja shadow-[0_30px_60px_-20px_rgba(11,42,35,0.5)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-linea px-6 py-4">
          <div>
            <h3 className="font-display text-[19px] font-extrabold text-ink">{titulo}</h3>
            {sub && <p className="mt-0.5 text-[13px] text-inksoft">{sub}</p>}
          </div>
          <button
            onClick={onCerrar}
            className="rounded-md p-1.5 text-inkfaint transition hover:bg-paper hover:text-ink active:scale-90"
            aria-label="Cerrar"
          >
            <IcX />
          </button>
        </div>
        <div className="max-h-[76vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Confirmar ---------------- */

export function Confirmar({
  abierto,
  onCerrar,
  titulo,
  mensaje,
  onConfirmar,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  mensaje: ReactNode;
  onConfirmar: () => void;
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} ancho="max-w-md">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-birome/12 p-2 text-birome">
          <IcAlerta />
        </span>
        <p className="text-[14px] leading-relaxed text-inksoft">{mensaje}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <BtnSec onClick={onCerrar}>Cancelar</BtnSec>
        <button
          onClick={() => {
            onConfirmar();
            onCerrar();
          }}
          className="rounded-lg bg-birome px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
        >
          Sí, eliminar
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Botones ---------------- */

export function BtnPri({
  children,
  onClick,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-pizarra px-4 py-2 text-sm font-bold text-tiza shadow-[0_2px_0_#0b2a23] transition hover:-translate-y-0.5 hover:bg-pizdark hover:shadow-[0_4px_0_#0b2a23] active:translate-y-0.5 active:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnSec({
  children,
  onClick,
  className = "",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border-[1.5px] border-linea bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-ink/30 hover:bg-paper active:scale-[0.97] ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------- Campo de formulario ---------------- */

export function Campo({
  label,
  error,
  req,
  children,
}: {
  label: string;
  error?: string;
  req?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-extrabold uppercase tracking-wide text-inksoft">
        {label} {req && <span className="text-birome">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[12px] font-bold text-birome">{error}</span>}
    </label>
  );
}

/* ---------------- Chip de categoría ---------------- */

export function Chip({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
      style={{ background: `${color}1f`, color }}
    >
      {children}
    </span>
  );
}

/* ---------------- Toasts ---------------- */

export function ToastHost() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[min(340px,90vw)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`anim-pop pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px] font-bold shadow-lg ${
            t.tono === "ok"
              ? "border-domi/30 bg-hoja text-domi"
              : t.tono === "warn"
                ? "border-lapizdeep/40 bg-hoja text-[#8a6508]"
                : "border-hosp/30 bg-hoja text-hosp"
          }`}
        >
          {t.tono === "ok" ? <IcCheck /> : t.tono === "warn" ? <IcAlerta /> : <IcInfo />}
          <span className="text-ink">{t.texto}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Estado vacío ---------------- */

export function Vacio({
  titulo,
  texto,
  accion,
}: {
  titulo: string;
  texto: string;
  accion?: ReactNode;
}) {
  return (
    <div className="ficha anim-fade-up flex flex-col items-center px-8 py-14 text-center">
      <svg viewBox="0 0 120 90" className="w-40 text-inkfaint">
        <rect x="18" y="14" width="70" height="62" rx="6" fill="#fffdf6" stroke="currentColor" strokeWidth="2" />
        <line x1="28" y1="30" x2="78" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".5" />
        <line x1="28" y1="42" x2="70" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".35" />
        <line x1="28" y1="54" x2="74" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".25" />
        <path d="M84 70 104 50" stroke="#ffc531" strokeWidth="7" strokeLinecap="round" />
        <path d="M104 50l4-4" stroke="#e8a90f" strokeWidth="7" strokeLinecap="round" />
        <path d="M84 70l-2 7 9-5" fill="#26303b" />
      </svg>
      <h3 className="mt-4 font-display text-lg font-extrabold text-ink">{titulo}</h3>
      <p className="mt-1 max-w-sm text-[14px] text-inksoft">{texto}</p>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}
