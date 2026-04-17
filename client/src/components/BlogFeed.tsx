"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { getToken, type Post } from "@/lib/api";
import type { BlogListTab } from "@/lib/blogQuery";
import { blogListHref } from "@/lib/blogQuery";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";
import BlogPagination from "@/components/BlogPagination";

type Props = {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
  kategori: BlogListTab;
  ara: string;
};

function BlogSearchBar({ kategori, initialAra }: { kategori: BlogListTab; initialAra: string }) {
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
      router.push(blogListHref({ sayfa: 1, kategori, ara: next }));
    }, 450);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [q, initialAra, kategori, router]);

  return (
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
  );
}

export default function BlogFeed({ posts, total, page, totalPages, kategori, ara }: Props) {
  const tabs: { key: BlogListTab; label: string; active: string }[] = [
    { key: "ALL", label: "Tümü", active: "bg-slate-700 text-slate-50" },
    { key: "TECH", label: "TECH", active: "bg-indigo-500 text-white" },
    { key: "ACADEMIC", label: "ACADEMIC", active: "bg-emerald-600 text-white" },
    { key: "GÜNLÜK", label: "GÜNLÜK", active: "bg-rose-500 text-white" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5 rounded-2xl border p-1.5"
          style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
        >
          {tabs.map(t => (
            <Link
              key={t.key}
              href={blogListHref({ sayfa: 1, kategori: t.key, ara })}
              prefetch={false}
              scroll={false}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                kategori === t.key ? t.active : "hover:bg-slate-700/40"
              }`}
              style={kategori === t.key ? undefined : { color: "rgb(var(--t3))" }}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <BlogSearchBar kategori={kategori} initialAra={ara} />
      </div>

      <p className="text-xs" style={{ color: "rgb(var(--t-muted))" }}>
        {total === 0
          ? "Sonuç yok."
          : totalPages > 1
            ? `${total} yazı · sayfa ${page} / ${totalPages}`
            : `${total} yazı`}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.04}>
            <PostCard post={p} />
          </Reveal>
        ))}
        {!posts.length && (
          <Reveal>
            <div
              className="flex flex-col gap-4 rounded-2xl border p-6 text-sm md:col-span-2 lg:col-span-3"
              style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
            >
              <p>
                {ara.trim()
                  ? `"${ara.trim()}" için sonuç bulunamadı.`
                  : "Bu kategoride henüz yazı yok."}
              </p>
              {!ara.trim() && kategori === "GÜNLÜK" && getToken() ? (
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

      <BlogPagination page={page} totalPages={totalPages} kategori={kategori} ara={ara} />
    </div>
  );
}
