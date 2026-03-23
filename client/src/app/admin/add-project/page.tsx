"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { createProject, uploadImage } from "@/lib/api";

const inp = "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/25 placeholder:opacity-40";
const inpSt = { background: "rgb(var(--surface2))", borderColor: "rgb(var(--border))", color: "rgb(var(--t1))" };
const lbl = "text-xs font-semibold";
const lblSt = { color: "rgb(var(--t3))" };

export default function AddProjectPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title,    setTitle]    = useState("");
  const [summary,  setSummary]  = useState("");
  const [techStack,setTechStack]= useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading,setUploading]= useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const tech = useMemo(() =>
    techStack.split(",").map(s => s.trim()).filter(Boolean),
  [techStack]);

  const canSubmit = title.trim().length >= 3 && summary.trim().length >= 10 && tech.length > 0 && !loading;

  async function onPickImage(file: File | null) {
    if (!file) return;
    setError(null); setUploading(true);
    try { const { url } = await uploadImage(file); setImageUrl(url); }
    catch (e) { setError(e instanceof Error ? e.message : "Görsel yüklenemedi."); }
    finally { setUploading(false); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await createProject({ title: title.trim(), summary: summary.trim(), tech, imageUrl: imageUrl.trim() || null });
      router.replace("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Proje eklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          Admin · Yeni Proje
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "rgb(var(--t1))" }}>
          Yeni Proje
        </h1>
        <p className="text-sm leading-7" style={{ color: "rgb(var(--t3))" }}>
          Tech stack&apos;i virgülle ayır. Görsel URL opsiyoneldir.
        </p>
      </header>

      <form onSubmit={onSubmit} className="rounded-3xl border p-6 space-y-4"
        style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className={lbl} style={lblSt}>Proje Adı <span className="text-rose-400">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inp} style={inpSt} placeholder="Phishing Tespit Sistemi" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className={lbl} style={lblSt}>Açıklama <span className="text-rose-400">*</span></label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} className={`${inp} min-h-28 resize-y`} style={inpSt} placeholder="Bu proje…" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className={lbl} style={lblSt}>Tech Stack (virgülle)</label>
            <input value={techStack} onChange={e => setTechStack(e.target.value)} className={inp} style={inpSt} placeholder="Python, FastAPI, PostgreSQL, Docker" required />
            {tech.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tech.slice(0, 8).map(t => (
                  <span key={t} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-400">{t}</span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className={lbl} style={lblSt}>Görsel URL</label>
            <div className="flex gap-2">
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={`${inp} flex-1`} style={inpSt} placeholder="https://..." />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:brightness-110 disabled:opacity-50"
                style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}>
                {uploading
                  ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  : <UploadCloud className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => void onPickImage(e.target.files?.[0] ?? null)} />
            </div>
            {imageUrl.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl.trim()} alt="Önizleme" className="mt-2 h-32 w-full rounded-xl object-cover border"
                style={{ borderColor: "rgb(var(--surface2))" }} />
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">{error}</div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:brightness-110"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t1))" }}>
            Vazgeç
          </button>
          <button type="submit" disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 disabled:opacity-60 transition">
            {loading ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
