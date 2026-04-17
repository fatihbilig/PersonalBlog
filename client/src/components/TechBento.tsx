"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";

const skills = [
  { name: "Node.js / TypeScript/ Express  ",  pct: 75, color: "#6366f1" },
  { name: "Python / Pandas / NumPy / Scikit-learn / Matplotlib / PyTorch",       pct: 60, color: "#8b5cf6" },
  { name: "MySQL / Ms SQL / Prisma",         pct: 85, color: "#34d399" },
  { name: "NLP teknikleri ",          pct: 45, color: "#f472b6" },
  { name: "Docker / Git / Postman",   pct: 60, color: "#60a5fa" },
  { name: "ASP .Net MVC / C# / Entity Framework",         pct: 80, color: "#fb923c" },
];

const stacks = [
  {
    title: "Backend & Databases",
    subtitle: "API tasarımı & üretim pratikleri",
    items: ["Node.js", "TypeScript", "Express", "Prisma", "MySQL","Ms SQL"," ASP.Net MVC","Entity Framework", "C#"],
    accent: "#6366f1",
    icon: "🖥️",
    wide: true,
  },
  {
    title: "Frontend & UI",
    subtitle: "Görsel tasarım & kullanıcı deneyimi",
    items: ["HTML", "CSS", "JavaScript", "Tailwind CSS","Bootstrap","Canva"],
    accent: "#ec63f1",
    icon: "🖥️",
    wide: true,
  },
  {
    title: "Oyun Geliştirme",
    subtitle: "Unity ile 2D/3D oyun tasarımı",
    items: ["Unity", "C#", "Oyun Mekanikleri", "Fizik Simülasyonu","Oyun Tasarımı"],
    accent: "#6366f1",
    icon: "🎮",
    wide: true,
  },
  {
    title: "Görüntü İşleme",
    subtitle: "Basit görüntü işleme teknikleri",
    items: ["MatLab", "Matplotlib","Görüntü Filtreleme","Kenar Algılama"],
    accent: "#6366f1",
    icon: "🎮",
    wide: true,
  },
  
  {
    title: "AI / NLP",
    subtitle: "Metin işleme & model denemeleri",
    items: ["Python", "PyTorch", "NLTK", "Transformers","numpy","pandas","LLM","RAG","Veri Madenciliği","Derin Öğrenme"],
    accent: "#8b5cf6",
    icon: "🧠",
    wide: false,
  },
  {
    title: "Araçlar",
    subtitle: "Günlük üretim & dağıtım akışı",
    items: ["Git", "Docker","Postman", "VS Code"],
    accent: "#34d399",
    icon: "🔧",
    wide: true,
  },
] as const;

function SkillBar({ name, pct, color, delay }: { name: string; pct: number; color: string; delay: number }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (el) el.style.width = `${pct}%`;
          }, delay);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el.parentElement!);
    return () => obs.disconnect();
  }, [pct, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold" style={{ color: "rgb(var(--t2))" }}>
        <span>{name}</span>
        <span style={{ color: color }}>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgb(var(--surface2))" }}>
        <div
          ref={barRef}
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{ width: 0, background: `linear-gradient(90deg, ${color}cc, ${color})` }}
        />
      </div>
    </div>
  );
}

export default function TechBento() {
  return (
    <section className="space-y-6">
      <Reveal>
        <div className="space-y-2">
          <h2 className="text-xl font-black" style={{ color: "rgb(var(--t1))" }}>
            Teknoloji Yığını
          </h2>
          <p className="text-sm" style={{ color: "rgb(var(--t3))" }}>
            Çalıştığım araçlar, kullandığım teknolojiler ve yetkinlik seviyeleri.
          </p>
          <div className="h-px bg-gradient-to-r from-indigo-500/60 via-violet-500/30 to-transparent" />
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Stack cards */}
        {stacks.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.07}>
            <div
              className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.wide ? "lg:col-span-2" : ""}`}
              style={{
                background: `linear-gradient(135deg, ${c.accent}18 0%, rgb(var(--surface)) 60%)`,
                borderColor: `${c.accent}40`,
              }}
            >
              {/* Glow on hover */}
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `${c.accent}30` }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <div className="text-sm font-black" style={{ color: "rgb(var(--t1))" }}>{c.title}</div>
                    <div className="text-xs" style={{ color: "rgb(var(--t3))" }}>{c.subtitle}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.items.map(item => (
                    <span
                      key={item}
                      className="rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{
                        borderColor: `${c.accent}50`,
                        background: `${c.accent}15`,
                        color: c.accent,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Skill bars */}
      <Reveal delay={0.15}>
        <div
          className="rounded-3xl border p-6 space-y-5"
          style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
        >
          <div className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>
            Yetkinlik Haritası
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((s, i) => (
              <SkillBar key={s.name} {...s} delay={i * 100} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
