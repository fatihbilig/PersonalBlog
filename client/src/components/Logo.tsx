type LogoProps = {
  size?: number;
  className?: string;
};

/**
 * Monogram: aurora çerçeve, tema uyumlu gövde, gradient F, köşe vurgusu.
 */
export default function Logo({ size = 36, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="fatih-logo-aurora" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="0.4" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="fatih-logo-rim" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="fatih-logo-f" x1="14" y1="12" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#eef2ff" />
          <stop offset="0.4" stopColor="#c7d2fe" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id="fatih-logo-glint" x1="14" y1="10" x2="26" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Dış aurora halka */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="13.5"
        stroke="url(#fatih-logo-aurora)"
        strokeWidth="1.2"
        opacity="0.65"
      />

      {/* Gövde */}
      <rect
        x="5"
        y="5"
        width="38"
        height="38"
        rx="11.5"
        style={{ fill: "rgb(var(--surface))" }}
        stroke="url(#fatih-logo-rim)"
        strokeWidth="1.25"
      />

      {/* Üst cam parıltısı */}
      <path
        d="M11 15.5c5.5-2.2 12.5-3 20-2 4 0.6 7 1.5 7 1.5"
        stroke="url(#fatih-logo-glint)"
        strokeWidth="2.25"
        strokeLinecap="round"
      />

      {/* F monogram */}
      <path
        fill="url(#fatih-logo-f)"
        d="M15 12h14v2.5H18v6.5h9v2.5h-9V34h-3V12z"
      />

      {/* Köşe noktası + hale */}
      <circle cx="36.25" cy="12.75" r="4" fill="#34d399" opacity="0.2" />
      <circle cx="36.25" cy="12.75" r="2.15" fill="#6ee7b7" />
      <circle cx="35.6" cy="12.1" r="0.65" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}
