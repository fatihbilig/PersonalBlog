export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Fatih Logo"
    >
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="50%"  stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Hexagon background */}
      <path
        d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
        fill="url(#lg2)"
        opacity="0.15"
      />
      <path
        d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
        stroke="url(#lg1)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Letter F */}
      <text
        x="12"
        y="27"
        fontFamily="'Inter', system-ui, sans-serif"
        fontWeight="900"
        fontSize="20"
        fill="url(#lg1)"
        letterSpacing="-1"
      >
        F
      </text>
      {/* Small dot accent */}
      <circle cx="28" cy="14" r="2.5" fill="#34d399" opacity="0.9" />
    </svg>
  );
}
