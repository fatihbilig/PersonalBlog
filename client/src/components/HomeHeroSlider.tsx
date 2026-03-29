"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { HERO_SLIDES } from "@/lib/hero-slides";

const AUTO_MS = 6500;

type HomeHeroSliderProps = {
  /** Ana sayfa üst ızgarasında: tam sütun genişliği, orta hizalama yok */
  variant?: "centered" | "column";
};

export default function HomeHeroSlider({ variant = "centered" }: HomeHeroSliderProps) {
  const n = HERO_SLIDES.length;
  const [idx, setIdx] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const paused = manualPaused || hovered;
  const slideFrac = n > 0 ? 100 / n : 0;
  const trackTransform = `translateX(-${idx * slideFrac}%)`;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
      setIdx(i => (i + dir + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (n <= 1 || paused || reduceMotion) return;
    const id = window.setTimeout(() => {
      setIdx(i => (i + 1) % n);
    }, AUTO_MS);
    return () => window.clearTimeout(id);
  }, [idx, paused, reduceMotion, n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (n === 0) return null;

  const shell =
    variant === "column"
      ? "relative w-full overflow-hidden rounded-3xl border shadow-2xl shadow-indigo-950/20"
      : "relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl shadow-indigo-950/20 lg:max-w-3xl";

  return (
    <section
      className={shell}
      style={{ borderColor: "rgb(var(--surface2))" }}
      aria-roledescription="carousel"
      aria-label="Öne çıkan fotoğraflar"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative w-full touch-pan-y overflow-hidden bg-black"
        style={{
          height: "clamp(300px, min(58vmin, 52vw), 520px)",
        }}
        onTouchStart={e => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={e => {
          if (touchStartX.current == null) return;
          const endX = e.changedTouches[0]?.clientX;
          if (endX == null) return;
          const dx = endX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) < 48) return;
          go(dx > 0 ? -1 : 1);
        }}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(.32,.72,0,1)] will-change-transform"
          style={{
            width: `${n * 100}%`,
            transform: trackTransform,
          }}
        >
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              className="box-border flex h-full shrink-0 items-center justify-center overflow-hidden bg-black px-2 py-2 sm:px-3 sm:py-3"
              style={{ width: `${slideFrac}%` }}
              aria-hidden={i !== idx}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
                className="max-h-full max-w-full object-contain object-center rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/35 to-transparent" aria-hidden />

        <div className="absolute left-3 top-3 z-20 flex items-center gap-2 sm:left-4 sm:top-4">
          <span className="pointer-events-none rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md">
            {idx + 1} / {n}
          </span>
          {!reduceMotion && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setManualPaused(p => !p);
              }}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/60"
              aria-label={manualPaused ? "Otomatik kaydırmayı aç" : "Otomatik kaydırmayı durdur"}
            >
              {manualPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/65 md:flex"
          aria-label="Önceki fotoğraf"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/65 md:flex"
          aria-label="Sonraki fotoğraf"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center px-4 pb-3 sm:px-6 sm:pb-3.5">
          <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-2 shrink-0 rounded-full transition-all duration-300 ${
                  i === idx ? "w-8 bg-white shadow-lg shadow-indigo-500/40" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Slayt ${i + 1}`}
                aria-current={i === idx}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
