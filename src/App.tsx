import { useState } from "react";
import { StoreProvider, useStore } from "./store";
import type { Vista } from "./types";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import StudentsView from "./components/Students";
import Planner from "./components/Planner";
import { ToastHost } from "./components/ui";
import { IcGithub, IcGuardar, IcMenu } from "./icons";

const REPO_URL = "https://github.com/profelili/carpetadidactica";

const TITULOS: Record<Vista, string> = {
  dashboard: "Panel de control",
  domiciliarios: "Alumnos Domiciliarios",
  hospitalarios: "Alumnos Hospitalarios",
  hogares: "Alumnos de Hogares",
  otros: "Otros alumnos",
  panel: "Panel de alumnos",
  planificador: "Planificador de actividades",
};

function ChipGuardado() {
  const { guardando, savedAt } = useStore();
  return (
    <div
      className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[11.5px] font-extrabold transition sm:flex ${
        guardando
          ? "border-lapizdeep/40 bg-lapiz/15 text-[#7a5a06]"
          : "border-domi/25 bg-domi/8 text-domi"
      }`}
      title="Cada cambio se guarda solo en este dispositivo"
    >
      <span className="relative flex h-2 w-2">
        {!guardando && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-domi opacity-50" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${guardando ? "animate-pulse bg-lapizdeep" : "bg-domi"}`}
        />
      </span>
      {guardando ? "Guardando…" : savedAt ? `Guardado · ${savedAt}` : "Guardado automático"}
    </div>
  );
}

function Shell() {
  const [vista, setVista] = useState<Vista>("dashboard");
  const [menu, setMenu] = useState(false);

  const ir = (v: Vista) => {
    setVista(v);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Sidebar vista={vista} ir={ir} abierta={menu} onCerrar={() => setMenu(false)} />

      {/* línea de margen de cuaderno */}
      <div className="pointer-events-none fixed inset-y-0 left-[286px] z-10 hidden w-px bg-birome/25 lg:block" />
      <div className="pointer-events-none fixed inset-y-0 left-[290px] z-10 hidden w-px bg-birome/15 lg:block" />

      <div className="flex min-h-screen flex-1 flex-col">
        {/* barra superior */}
        <header className="sticky top-0 z-30 border-b border-linea/80 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[1180px] items-center gap-3 px-4 py-3 sm:px-8 lg:pl-12">
            <button
              onClick={() => setMenu(true)}
              className="rounded-lg border-[1.5px] border-linea bg-hoja p-2 text-ink transition hover:border-ink/30 active:scale-90 lg:hidden"
              aria-label="Abrir menú"
            >
              <IcMenu />
            </button>
            <p className="font-hand text-[21px] leading-none text-inkfaint">
              {vista === "dashboard" ? "carpeta n.º 1 ✎" : TITULOS[vista].toLowerCase()}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <ChipGuardado />
              <span className="hidden items-center gap-1.5 rounded-full border border-linea bg-hoja px-3 py-1.5 text-[11.5px] font-extrabold text-inksoft md:inline-flex">
                <IcGuardar width="1em" height="1em" className="text-domi" />
                autosave activo
              </span>
            </div>
          </div>
        </header>

        {/* contenido */}
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-7 sm:px-8 lg:pl-12 lg:pr-8">
          <div key={vista}>
            {vista === "dashboard" && <Dashboard ir={ir} />}
            {(vista === "domiciliarios" ||
              vista === "hospitalarios" ||
              vista === "hogares" ||
              vista === "otros") && <StudentsView categoria={vista} />}
            {vista === "panel" && <StudentsView categoria="todos" />}
            {vista === "planificador" && <Planner />}
          </div>
        </main>

        <footer className="border-t border-linea/70">
          <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-[12px] font-bold text-inkfaint sm:px-8 lg:pl-12">
            <p>
              <span className="font-display font-extrabold text-inksoft">Carpeta Didáctica</span> — hecha
              para docentes de modalidades especiales.
            </p>
            <div className="flex items-center gap-3">
              <p className="hidden font-hand text-[17px] md:block">tus datos viven en este dispositivo ✿</p>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border-[1.5px] border-pizarra/25 bg-pizarra px-3.5 py-1.5 text-[11.5px] font-extrabold text-tiza transition hover:-translate-y-0.5 hover:bg-pizdark hover:shadow-md active:translate-y-0"
                title="Abrir repositorio del proyecto"
              >
                <IcGithub className="transition-transform duration-300 group-hover:rotate-12" />
                profelili/carpetadidactica
              </a>
            </div>
          </div>
        </footer>
      </div>

      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="flex">
        <Shell />
      </div>
    </StoreProvider>
  );
}
