"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, FolderGit2, Search, X } from "lucide-react";
import { getPosts, getProjects, type Post, type Project } from "@/lib/api";

/** Panel açılınca veri çeker — her sayfa yükünde API çağrısı yapmaz */
export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [indexLoading, setIndexLoading] = useState(false);
  const loadedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setQ("");
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    queueMicrotask(() => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      setIndexLoading(true);
      void Promise.all([getPosts(), getProjects()])
        .then(([p, pr]) => {
          setPosts(p);
          setProjects(pr);
        })
        .catch(() => {})
        .finally(() => setIndexLoading(false));
    });
    return () => window.clearTimeout(t);
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { posts: [] as Post[], projects: [] as Project[] };
    return {
      posts: posts
        .filter(p =>
          `${p.title} ${p.excerpt ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase().includes(query),
        )
        .slice(0, 5),
      projects: projects
        .filter(p => `${p.title} ${p.summary ?? ""}`.toLowerCase().includes(query))
        .slice(0, 4),
    };
  }, [q, posts, projects]);

  const total = results.posts.length + results.projects.length;

  const triggerStyle = {
    background: "rgb(var(--surface))",
    borderColor: "rgb(var(--surface2))",
    color: "rgb(var(--t3))",
  };

  if (!open)
    return (
      <button
        type="button"
        onClick={() => {
          setQ("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:border-indigo-500/40"
        style={triggerStyle}
        aria-label="Ara"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Ara</span>
        <kbd
          className="hidden rounded border px-1.5 py-0.5 text-[10px] sm:block"
          style={{
            background: "rgb(var(--surface2))",
            borderColor: "rgb(var(--border))",
            color: "rgb(var(--t3))",
          }}
        >
          ⌘K
        </kbd>
      </button>
    );

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center px-4 pt-16">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={() => setOpen(false)}
      />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
      >
        <div className="flex items-center gap-3 border-b px-4 py-4" style={{ borderColor: "rgb(var(--surface2))" }}>
          <Search className="h-5 w-5 shrink-0" style={{ color: "rgb(var(--t3))" }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Yazı, proje veya konu ara…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-slate-500"
            style={{ color: "rgb(var(--t1))" }}
            disabled={indexLoading}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 transition hover:bg-slate-200/80 dark:hover:bg-slate-700"
            style={{ color: "rgb(var(--t3))" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {indexLoading ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "rgb(var(--t3))" }}>
              İndeks yükleniyor…
            </div>
          ) : !q ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "rgb(var(--t3))" }}>
              Yazmaya başla…
            </div>
          ) : total === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "rgb(var(--t3))" }}>
              &ldquo;{q}&rdquo; için sonuç bulunamadı.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700/60">
              {results.posts.length > 0 && (
                <section className="p-2">
                  <div
                    className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "rgb(var(--t3))" }}
                  >
                    Yazılar
                  </div>
                  {results.posts.map(p => (
                    <Link
                      key={p.id}
                      href={`/blog/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/50"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium" style={{ color: "rgb(var(--t1))" }}>
                          {p.title}
                        </div>
                        {p.excerpt ? (
                          <div className="mt-0.5 truncate text-xs" style={{ color: "rgb(var(--t3))" }}>
                            {p.excerpt}
                          </div>
                        ) : null}
                      </div>
                      <ArrowRight className="ml-auto mt-0.5 h-4 w-4 shrink-0" style={{ color: "rgb(var(--t3))" }} />
                    </Link>
                  ))}
                </section>
              )}
              {results.projects.length > 0 && (
                <section className="p-2">
                  <div
                    className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "rgb(var(--t3))" }}
                  >
                    Projeler
                  </div>
                  {results.projects.map(p => (
                    <Link
                      key={p.id}
                      href="/projects"
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/50"
                    >
                      <FolderGit2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium" style={{ color: "rgb(var(--t1))" }}>
                          {p.title}
                        </div>
                        {p.summary ? (
                          <div className="mt-0.5 truncate text-xs" style={{ color: "rgb(var(--t3))" }}>
                            {p.summary}
                          </div>
                        ) : null}
                      </div>
                      <ArrowRight className="ml-auto mt-0.5 h-4 w-4 shrink-0" style={{ color: "rgb(var(--t3))" }} />
                    </Link>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
        {q && total > 0 && (
          <div
            className="border-t px-5 py-2.5 text-xs"
            style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
          >
            {total} sonuç bulundu
          </div>
        )}
      </div>
    </div>
  );
}
