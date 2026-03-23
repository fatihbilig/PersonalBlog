"use client";

import { useEffect, useState } from "react";

export default function AuraBackground() {
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        setT(Math.max(0, Math.min(1, y / h)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Indigo blob — dark: vivid, light: very soft */}
      <div
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[100px]"
        style={{
          background: "rgba(99,102,241,var(--aura-opacity,0.14))",
          transform: `translate3d(${t * 18}px,${t * 9}px,0)`,
        }}
      />
      {/* Violet blob */}
      <div
        className="absolute -right-40 top-0 h-[480px] w-[480px] rounded-full blur-[100px]"
        style={{
          background: "rgba(139,92,246,var(--aura-opacity,0.10))",
          transform: `translate3d(${t * -15}px,${t * 12}px,0)`,
        }}
      />
      {/* Emerald blob */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full blur-[100px]"
        style={{
          background: "rgba(52,211,153,var(--aura-opacity,0.06))",
          transform: `translate3d(${t * 10}px,${t * -18}px,0)`,
        }}
      />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
    </div>
  );
}
