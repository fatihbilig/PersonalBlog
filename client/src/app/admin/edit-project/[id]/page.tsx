"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProjects, getProjectById, updateProject, type Project } from "@/lib/api";

function useRouteId() {
  const p = useParams<{ id: string | string[] }>();
  const raw = p?.id;
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

export default function EditProjectPage() {
  const router = useRouter();
  const id = useRouteId();

  const [foundProj, setFoundProj] = useState<Project | null>(null);
  const [title,     setTitle]     = useState("");
  const [summary,   setSummary]   = useState("");
  const [techStack, setTechStack] = useState("");
  const [imageUrl,  setImageUrl]  = useState("");
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Geçersiz proje adresi.");
        setLoading(false);
        return;
      }
      const debug: string[] = [`Aranan ID: "${id}"`];
      try {
        let proj: Project | null = null;

        // Strateji 1: Doğrudan ID ile
        try {
          proj = await getProjectById(id);
          debug.push(`Strateji 1 başarılı: ${proj.title}`);
        } catch (e1) {
          debug.push(`Strateji 1 başarısız: ${e1 instanceof Error ? e1.message : e1}`);
        }

        // Strateji 2: Listeden tara
        if (!proj) {
          try {
            const projects = await getProjects();
            debug.push(`getProjects() başarılı: ${projects.length} proje`);
            proj = projects.find(p => String(p.id) === String(id) || p.slug === id) ?? null;
            if (proj) debug.push(`Listede bulundu: ${proj.title}`);
            else debug.push(`Listede bulunamadı`);
          } catch (e2) {
            debug.push(`getProjects() başarısız: ${e2 instanceof Error ? e2.message : e2}`);
          }
        }

        if (!proj) {
          setDebugInfo(debug.join(" | "));
          setError("Proje bulunamadı. Admin paneline dönüp tekrar deneyin.");
          setLoading(false);
          return;
        }

        setFoundProj(proj);
        setTitle(proj.title);
        setSummary(proj.summary ?? "");
        setTechStack((proj.tech ?? []).join(", "));
        setImageUrl(proj.imageUrl ?? "");
        setLoading(false);
      } catch (e) {
        debug.push(`Genel hata: ${e instanceof Error ? e.message : e}`);
        setDebugInfo(debug.join(" | "));
        setError(e instanceof Error ? e.message : "Proje yüklenemedi.");
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updateId = String(foundProj?.id ?? id);
      const tech = techStack.split(",").map(s => s.trim()).filter(Boolean);
      await updateProject(updateId, {
        title:    title.trim(),
        summary:  summary.trim(),
        tech,
        imageUrl: imageUrl.trim() || null,
      });
      router.replace("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/25";

  const tech = techStack.split(",").map(s => s.trim()).filter(Boolean);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-sm text-slate-400">Proje yükleniyor…</span>
      </div>
    );
  }

  if (error && !foundProj) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-10 w-10 text-rose-400" />
        <p className="text-center text-slate-300">{error}</p>
        {debugInfo && (
          <details className="max-w-lg text-xs text-slate-500">
            <summary className="cursor-pointer text-slate-400">Teknik Detay</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-slate-800 p-3">{debugInfo}</pre>
          </details>
        )}
        <Link href="/admin" className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition">
          ← Admin Paneli
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition">
          <ArrowLeft className="h-4 w-4" />Admin Paneli
        </Link>
        <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          Proje Düzenle
        </div>
        <h1 className="text-2xl font-black text-slate-50">Projeyi Düzenle</h1>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Proje Adı <span className="text-rose-400">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inp} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Açıklama <span className="text-rose-400">*</span></label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} className={`${inp} resize-none`} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Tech Stack (virgülle)</label>
            <input value={techStack} onChange={e => setTechStack(e.target.value)} className={inp} placeholder="Python, FastAPI, MySQL…" />
            {tech.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tech.map(t => (
                  <span key={t} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-300">{t}</span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Görsel URL</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inp} placeholder="https://..." />
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Önizleme" className="h-20 w-full rounded-xl object-cover border border-slate-700" />
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span className="text-sm text-rose-200">{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.push("/admin")}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition">
            Vazgeç
          </button>
          <button type="submit" disabled={saving || !title.trim() || !summary.trim()}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 transition">
            {saving
              ? <><span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Kaydediliyor…</>
              : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
