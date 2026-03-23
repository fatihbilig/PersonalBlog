"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { getToken, type Post } from "@/lib/api";
import { normalizePostCategory } from "@/lib/postCategory";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";

type Tab = "ALL" | "TECH" | "ACADEMIC" | "GÜNLÜK";

export default function BlogFeed({ posts }: { posts: Post[] }) {
  const [tab, setTab] = useState<Tab>("ALL");
  const [q, setQ]     = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter(p => {
      const cat = normalizePostCategory(p.category);
      const inTab = tab === "ALL" || cat === tab;
      if (!inTab) return false;
      if (!query) return true;
      return `${p.title} ${p.excerpt ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase().includes(query);
    });
  }, [posts, tab, q]);

  const tabs: { key: Tab; label: string; active: string }[] = [
    { key: "ALL",      label: "Tümü",     active: "bg-slate-700 text-slate-50" },
    { key: "TECH",     label: "TECH",     active: "bg-indigo-500 text-white" },
    { key: "ACADEMIC", label: "ACADEMIC", active: "bg-emerald-600 text-white" },
    { key: "GÜNLÜK",   label: "GÜNLÜK",   active: "bg-rose-500 text-white" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5 rounded-2xl border p-1.5"
          style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
        >
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.key ? t.active : "hover:bg-slate-700/40"
              }`}
              style={tab === t.key ? undefined : { color: "rgb(var(--t3))" }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "rgb(var(--t3))" }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Ara…"
            className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            style={{
              background: "rgb(var(--surface))",
              borderColor: "rgb(var(--surface2))",
              color: "rgb(var(--t1))",
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.04}>
            <PostCard post={p} />
          </Reveal>
        ))}
        {!filtered.length && (
          <Reveal>
            <div
              className="flex flex-col gap-4 rounded-2xl border p-6 text-sm"
              style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
            >
              <p>{q ? `"${q}" için sonuç bulunamadı.` : "Bu kategoride henüz yazı yok."}</p>
              {!q && tab === "GÜNLÜK" && getToken() ? (
                <Link
                  href="/admin/add-post?category=GÜNLÜK"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Günlük yazısı ekle
                </Link>
              ) : null}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
