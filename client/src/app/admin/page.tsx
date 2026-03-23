"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Eye, FolderGit2, Pencil, Plus, RefreshCw, Trash2,
} from "lucide-react";
import {
  deletePost, deleteProject, getAdminStats, getPosts, getProjects,
  type Post, type Project,
} from "@/lib/api";

const AdminStatsCharts = dynamic(() => import("@/components/AdminStatsCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2 h-[280px] animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
      <div className="h-[280px] animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
    </div>
  ),
});

const card = "rounded-2xl border p-5 transition-all";
const cardStyle = { background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" };

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className={card} style={cardStyle}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ background: `${color}20`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>{label}</div>
          <div className="text-2xl font-black" style={{ color: "rgb(var(--t1))" }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [posts, setPosts]       = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats]       = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const totals = useMemo(() => ({ posts: posts.length, projects: projects.length }), [posts.length, projects.length]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => { counts[p.category] = (counts[p.category] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [posts]);

  const topPostsData = useMemo(() =>
    (stats?.topPosts ?? []).slice(0, 5).map(p => ({ name: p.title.slice(0, 18) + "…", views: p.viewCount })),
  [stats]);

  async function refresh() {
    setError(null); setLoading(true);
    try {
      const [p, pr, st] = await Promise.all([getPosts(), getProjects(), getAdminStats().catch(() => null)]);
      setPosts(p); setProjects(pr); setStats(st);
    } catch (e) { setError(e instanceof Error ? e.message : "Veriler yüklenemedi."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  async function onDeletePost(id: string) {
    if (!confirm("Bu yazıyı silmek istiyorsun?")) return;
    try { await deletePost(id); setPosts(prev => prev.filter(x => x.id !== id)); }
    catch (e) { alert(e instanceof Error ? e.message : "Silme başarısız."); }
  }

  async function onDeleteProject(id: string) {
    if (!confirm("Bu projeyi silmek istiyorsun?")) return;
    try { await deleteProject(id); setProjects(prev => prev.filter(x => x.id !== id)); }
    catch (e) { alert(e instanceof Error ? e.message : "Silme başarısız."); }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            Yönetim Paneli
          </div>
          <h1 className="mt-2 text-2xl font-black" style={{ color: "rgb(var(--t1))" }}>Admin Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "rgb(var(--t3))" }}>İçerik yönetimi, istatistikler ve analitik.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-slate-700"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t2))" }}>
            <RefreshCw className="h-4 w-4" />Yenile
          </button>
          <Link href="/admin/add-post"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110">
            <Plus className="h-4 w-4" />Yeni Yazı
          </Link>
          <Link href="/admin/add-project"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110">
            <Plus className="h-4 w-4" />Yeni Proje
          </Link>
        </div>
      </header>

      {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={BookOpen}   label="Toplam Yazı"           value={totals.posts}                           color="#6366f1" />
        <StatCard icon={FolderGit2} label="Toplam Proje"          value={totals.projects}                        color="#8b5cf6" />
        <StatCard icon={Eye}        label="Toplam Görüntülenme"   value={stats?.counts.totalViews ?? "—"}        color="#34d399" />
      </div>

      {/* Charts row */}
      {!loading && (
        <AdminStatsCharts topPostsData={topPostsData} categoryData={categoryData} />
      )}

      {/* Posts table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "rgb(var(--t1))" }}>Yazılar</h2>
          <Link href="/admin/add-post" className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition">
            <Plus className="h-3.5 w-3.5" />Yeni
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgb(var(--surface2))" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "rgb(var(--surface))" }}>
              <tr className="border-b" style={{ borderColor: "rgb(var(--surface2))" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>Başlık</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold sm:table-cell" style={{ color: "rgb(var(--t3))" }}>Kategori</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold sm:table-cell" style={{ color: "rgb(var(--t3))" }}>Tarih</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: "rgb(var(--t3))" }}>Yükleniyor…</td></tr>
              ) : !posts.length ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: "rgb(var(--t3))" }}>Yazı bulunamadı.</td></tr>
              ) : posts.map(p => (
                <tr key={p.id} className="transition hover:bg-slate-800/40" style={{ borderColor: "rgb(var(--surface2))" }}>
                  <td className="px-4 py-3">
                    <div className="font-semibold line-clamp-1" style={{ color: "rgb(var(--t1))" }}>{p.title}</div>
                    <div className="hidden text-xs mt-0.5 line-clamp-1 sm:hidden" style={{ color: "rgb(var(--t3))" }}>{p.excerpt}</div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      p.category === "TECH" ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                      : p.category === "ACADEMIC" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`}>{p.category}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs sm:table-cell" style={{ color: "rgb(var(--t3))" }}>
                    {p.date ?? p.createdAt?.slice(0, 10) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/edit-post/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition">
                        <Pencil className="h-3.5 w-3.5" />Düzenle
                      </Link>
                      <button type="button" onClick={() => void onDeletePost(p.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition">
                        <Trash2 className="h-3.5 w-3.5" />Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Projects table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "rgb(var(--t1))" }}>Projeler</h2>
          <Link href="/admin/add-project" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition">
            <Plus className="h-3.5 w-3.5" />Yeni
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgb(var(--surface2))" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "rgb(var(--surface))" }}>
              <tr className="border-b" style={{ borderColor: "rgb(var(--surface2))" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>Proje</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold sm:table-cell" style={{ color: "rgb(var(--t3))" }}>Tech</th>
                <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm" style={{ color: "rgb(var(--t3))" }}>Yükleniyor…</td></tr>
              ) : !projects.length ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm" style={{ color: "rgb(var(--t3))" }}>Proje bulunamadı.</td></tr>
              ) : projects.map((p: Project) => (
                <tr key={p.id} className="transition hover:bg-slate-800/40" style={{ borderColor: "rgb(var(--surface2))" }}>
                  <td className="px-4 py-3">
                    <div className="font-semibold line-clamp-1" style={{ color: "rgb(var(--t1))" }}>{p.title}</div>
                    <div className="text-xs mt-0.5 line-clamp-1" style={{ color: "rgb(var(--t3))" }}>{p.summary}</div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(p.tech ?? []).slice(0, 3).map(t => (
                        <span key={t} className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/edit-project/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition">
                        <Pencil className="h-3.5 w-3.5" />Düzenle
                      </Link>
                      <button type="button" onClick={() => void onDeleteProject(p.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition">
                        <Trash2 className="h-3.5 w-3.5" />Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
