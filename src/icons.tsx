import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: "1.25em",
  height: "1.25em",
  ...props,
});

export const IcCarpeta = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6c.6 0 1.2.24 1.62.66l.9.9h6.88A2.5 2.5 0 0 1 21 9.06V16.5A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
    <path d="M3 10.2h18" />
    <path d="M7.5 14.5h6" />
  </svg>
);

export const IcDomicilio = (p: P) => (
  <svg {...base(p)}>
    <path d="m3.5 11 8.5-7 8.5 7" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5.5h4V20" />
  </svg>
);

export const IcHospital = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 20V6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5V20" />
    <path d="M3 20h18" />
    <path d="M12 9v6" />
    <path d="M9 12h6" />
    <path d="M8.5 5V3.5h7V5" />
  </svg>
);

export const IcHogar = (p: P) => (
  <svg {...base(p)}>
    <path d="m3.5 11.5 8.5-7 8.5 7" />
    <path d="M5.5 10V20h13V10" />
    <circle cx="9.7" cy="13.2" r="1.5" />
    <path d="M7 17.5c.4-1.4 1.4-2.1 2.7-2.1s2.3.7 2.7 2.1" />
    <circle cx="14.6" cy="13.4" r="1.2" />
    <path d="M12.7 17.5c.3-1.1 1-1.7 1.9-1.7s1.6.6 1.9 1.7" />
  </svg>
);

export const IcOtros = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 20 19 5.5" />
    <path d="m15 4.5 4.5.01L19.5 9" />
    <circle cx="6.5" cy="6.5" r="1.1" />
    <circle cx="7" cy="17" r="1.1" />
  </svg>
);

export const IcPanel = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.8" />
    <path d="M9.2 4.5v15" />
    <path d="M12.5 8.5h5" />
    <path d="M12.5 12h5" />
    <path d="M12.5 15.5h3" />
    <path d="M5.6 8.5h1.6" />
    <path d="M5.6 12h1.6" />
  </svg>
);

export const IcAgenda = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="1.8" />
    <path d="M3.5 9.5h17" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="m9 14.6 2.1 2.1 4-4.4" />
  </svg>
);

export const IcMas = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const IcLapiz = (p: P) => (
  <svg {...base(p)}>
    <path d="m14.5 5 4.5 4.5L8.5 20 3.6 20.4 4 15.5Z" />
    <path d="m12.8 6.7 4.5 4.5" />
  </svg>
);

export const IcTacho = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 6.5h15" />
    <path d="M8 6.5V4.8A1.3 1.3 0 0 1 9.3 3.5h5.4A1.3 1.3 0 0 1 16 4.8v1.7" />
    <path d="M6.3 6.5 7 19.2a1.4 1.4 0 0 0 1.4 1.3h7.2a1.4 1.4 0 0 0 1.4-1.3l.7-12.7" />
    <path d="M10 10.5v6" />
    <path d="M14 10.5v6" />
  </svg>
);

export const IcDoc = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V3.5Z" />
    <path d="M14 3.5V8h4.5" />
    <path d="M9 12.5h6" />
    <path d="M9 16h6" />
  </svg>
);

export const IcDescargar = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v11" />
    <path d="m7 10.5 5 5 5-5" />
    <path d="M4.5 19.5h15" />
  </svg>
);

export const IcBuscar = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15.3 15.3 5.2 5.2" />
  </svg>
);

export const IcCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5L19.5 6.5" />
  </svg>
);

export const IcX = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

export const IcReloj = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.4 2" />
  </svg>
);

export const IcEscuela = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 20V9.5L12 4l8.5 5.5V20" />
    <path d="M2.5 20h19" />
    <path d="M10 20v-4.5h4V20" />
    <path d="M12 9.2v2.2" />
    <circle cx="12" cy="8" r="0.3" />
  </svg>
);

export const IcUsuarios = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c.6-3.2 2.7-4.8 5.5-4.8s4.9 1.6 5.5 4.8" />
    <circle cx="16.5" cy="9.5" r="2.4" />
    <path d="M15.5 14.6c2.6.2 4.3 1.6 4.9 4.2" />
  </svg>
);

export const IcFlecha = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const IcAlerta = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.8 2.8 19.5h18.4Z" />
    <path d="M12 9.8v4.4" />
    <circle cx="12" cy="16.8" r="0.3" />
  </svg>
);

export const IcInfo = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5" />
    <circle cx="12" cy="8" r="0.3" />
  </svg>
);

export const IcMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </svg>
);

export const IcEstrella = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3.5 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.1l-5.1 2.8 1.1-5.6-4.2-3.9 5.7-.7Z" />
  </svg>
);

export const IcClip = (p: P) => (
  <svg {...base(p)}>
    <path d="m20 11.5-7.8 7.8a5 5 0 0 1-7-7L13 4.5a3.3 3.3 0 0 1 4.7 4.7l-7.8 7.7a1.7 1.7 0 0 1-2.4-2.4L15 7" />
  </svg>
);

export const IcGuardar = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3.5h11l3.5 3.5v12A1.5 1.5 0 0 1 18 20.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 5 3.5Z" />
    <path d="M8 3.5V8h7V3.5" />
    <path d="M8 20.5v-6h8v6" />
  </svg>
);

export const IcGoogle = (p: P) => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="none" {...p}>
    <path
      d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
      fill="#4285F4"
    />
    <path
      d="M12 21.5c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4H3.2v2.6A9.9 9.9 0 0 0 12 21.5Z"
      fill="#34A853"
    />
    <path
      d="M6.5 13.6a5.9 5.9 0 0 1 0-3.8V7.2H3.2a9.9 9.9 0 0 0 0 9l3.3-2.6Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.4c1.5 0 2.8.5 3.8 1.5L18.7 5A9.7 9.7 0 0 0 12 2.5a9.9 9.9 0 0 0-8.8 4.7l3.3 2.6A5.9 5.9 0 0 1 12 6.4Z"
      fill="#EA4335"
    />
  </svg>
);

export const IcGithub = (p: P) => (
  <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" fill="currentColor" stroke="none" {...p}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.37 9.37 0 0 1 5.01 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.93.68 1.89 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.05 10.05 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
  </svg>
);

export const IcSubir = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 16V4.5" />
    <path d="m6.5 9.5 5.5-5 5.5 5" />
    <path d="M4.5 16.5v1.8A1.7 1.7 0 0 0 6.2 20h11.6a1.7 1.7 0 0 0 1.7-1.7v-1.8" />
  </svg>
);
