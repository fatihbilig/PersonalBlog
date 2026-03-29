"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Project } from "@/lib/api";
import { projectListHref } from "@/lib/projectQuery";
import ProjectCard from "@/components/ProjectCard";
import ProjectPagination from "@/components/ProjectPagination";
import Reveal from "@/components/Reveal";

type Props = {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
  ara: string;
};

function ProjectSearchBar({ initialAra }: { initialAra: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialAra);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setQ(initialAra);
  }, [initialAra]);

  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      const next = q.trim();
      if (next === initialAra.trim()) return;
      router.push(projectListHref({ sayfa: 1, ara: next }));
    }, 450);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [q, initialAra, router]);

  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "rgb(var(--t3))" }} />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Başlık, açıklama veya teknoloji ara…"
        className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
        style={{
          background: "rgb(var(--surface))",
          borderColor: "rgb(var(--surface2))",
          color: "rgb(var(--t1))",
        }}
      />
    </div>
  );
}

export default function ProjectsListing({
  projects,
  total,
  page,
  totalPages,
  ara,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <ProjectSearchBar initialAra={ara} />
      </div>

      <p className="text-xs" style={{ color: "rgb(var(--t-muted))" }}>
        {total === 0
          ? "Sonuç yok."
          : totalPages > 1
            ? `${total} proje · sayfa ${page} / ${totalPages}`
            : `${total} proje`}
      </p>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.length ? (
          projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProjectCard project={p} />
            </Reveal>
          ))
        ) : (
          <Reveal>
            <div
              className="rounded-2xl border p-6 text-sm md:col-span-2 lg:col-span-3"
              style={{
                borderColor: "rgb(var(--surface2))",
                background: "rgb(var(--surface))",
                color: "rgb(var(--t3))",
              }}
            >
              {ara.trim()
                ? `"${ara.trim()}" için proje bulunamadı.`
                : "Henüz proje eklenmemiş."}
            </div>
          </Reveal>
        )}
      </section>

      <ProjectPagination page={page} totalPages={totalPages} ara={ara} />
    </div>
  );
}
