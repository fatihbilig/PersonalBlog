"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dokunmatik / az hareket tercihi / sekme arka planda iken devre dışı veya duraklatılır
 * (sürekli requestAnimationFrame sitenin kasmasına yol açabiliyordu).
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const sync = () => {
      setEnabled(!reduced.matches && !coarse.matches);
    };
    sync();
    reduced.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -200;
    let my = -200;
    let rx = -200;
    let ry = -200;
    let raf = 0;

    const tick = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!document.hidden && raf === 0) raf = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    };

    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(
        !!el.closest("a, button, input, textarea, select, [role=button], [data-hover]"),
      );
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver);
    document.addEventListener("visibilitychange", onVisibility);
    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          width: clicked ? 6 : hovered ? 10 : 8,
          height: clicked ? 6 : hovered ? 10 : 8,
          borderRadius: "50%",
          background: hovered ? "rgba(167,139,250,1)" : "rgba(99,102,241,1)",
          boxShadow: hovered
            ? "0 0 12px 3px rgba(167,139,250,0.6)"
            : "0 0 8px 2px rgba(99,102,241,0.5)",
          transform: "translate(-200px,-200px)",
          marginLeft: clicked ? -3 : hovered ? -5 : -4,
          marginTop: clicked ? -3 : hovered ? -5 : -4,
          transition:
            "width 0.2s, height 0.2s, margin 0.2s, background 0.2s, box-shadow 0.2s",
          willChange: "transform",
        }}
      />

      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
        style={{
          width: hovered ? 44 : clicked ? 28 : 36,
          height: hovered ? 44 : clicked ? 28 : 36,
          borderRadius: "50%",
          border: hovered
            ? "1.5px solid rgba(167,139,250,0.85)"
            : "1.5px solid rgba(99,102,241,0.55)",
          background: hovered ? "rgba(139,92,246,0.06)" : "transparent",
          transform: "translate(-200px,-200px)",
          marginLeft: hovered ? -22 : clicked ? -14 : -18,
          marginTop: hovered ? -22 : clicked ? -14 : -18,
          transition:
            "width 0.3s cubic-bezier(.22,1,.36,1), height 0.3s cubic-bezier(.22,1,.36,1), margin 0.3s cubic-bezier(.22,1,.36,1), border 0.2s, background 0.2s",
          willChange: "transform",
        }}
      />
    </>
  );
}
