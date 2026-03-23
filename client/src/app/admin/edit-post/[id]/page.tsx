"use client";

import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle, ArrowLeft, Eye, Pencil, SplitSquareHorizontal, UploadCloud,
} from "lucide-react";
import Link from "next/link";
import {
  getPosts, getPostBySlug, getPostById, updatePost, uploadImage, type Post, type PostCategory,
} from "@/lib/api";
import { normalizePostCategory } from "@/lib/postCategory";

const MDEditor  = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then(m => m.default.Markdown),
  { ssr: false },
);

type EditorMode = "edit" | "preview" | "split";

function useRouteId() {
  const p = useParams<{ id: string | string[] }>();
  const raw = p?.id;
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

export default function EditPostPage() {
  const router  = useRouter();
  const id      = useRouteId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [foundPost, setFoundPost] = useState<Post | null>(null);
  const [title,    setTitle]    = useState("");
  const [excerpt,  setExcerpt]  = useState("");
  const [category, setCategory] = useState<PostCategory>("TECH");
  const [content,  setContent]  = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mode,     setMode]     = useState<EditorMode>("split");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [debugInfo,setDebugInfo]= useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Geçersiz yazı adresi.");
        setLoading(false);
        return;
      }
      const debug: string[] = [`Aranan ID: "${id}"`];
      try {
        let post: Post | null = null;

        // ── Strateji 1: Doğrudan ID ile fetch ──────────────────────
        try {
          post = await getPostById(id);
          debug.push(`Strateji 1 (getPostById) başarılı: ${post.title}`);
        } catch (e1) {
          debug.push(`Strateji 1 (getPostById) başarısız: ${e1 instanceof Error ? e1.message : e1}`);
        }

        // ── Strateji 2: Tüm listeleri tara, id veya slug eşleşmesi ─
        if (!post) {
          try {
            const posts = await getPosts();
            debug.push(`getPosts() başarılı: ${posts.length} yazı`);
            // ID ile eşleştir (string veya number olabilir)
            post = posts.find(
              p => String(p.id) === String(id) || p.slug === id
            ) ?? null;
            if (post) debug.push(`Listede bulundu: ${post.title}`);
            else debug.push(`Listede bulunamadı (id: ${id})`);
          } catch (e2) {
            debug.push(`getPosts() başarısız: ${e2 instanceof Error ? e2.message : e2}`);
          }
        }

        // ── Strateji 3: Slug olarak dene ───────────────────────────
        if (!post) {
          try {
            post = await getPostBySlug(id);
            debug.push(`Strateji 3 (slug) başarılı: ${post.title}`);
          } catch (e3) {
            debug.push(`Strateji 3 (slug) başarısız: ${e3 instanceof Error ? e3.message : e3}`);
          }
        }

        if (!post) {
          setDebugInfo(debug.join(" | "));
          setError("Yazı bulunamadı. Lütfen admin paneline dönüp tekrar deneyin.");
          setLoading(false);
          return;
        }

        // ── İçerik eksikse slug ile tam yazıyı çek ─────────────────
        let fullPost = post;
        if (!fullPost.content && fullPost.slug) {
          try {
            fullPost = await getPostBySlug(fullPost.slug);
            debug.push(`İçerik slug ile alındı`);
          } catch {
            debug.push(`İçerik slug ile alınamadı, mevcut kullanılıyor`);
          }
        }

        setFoundPost(fullPost);
        setTitle(fullPost.title);
        setExcerpt(fullPost.excerpt ?? "");
        setCategory(normalizePostCategory(String(fullPost.category ?? "TECH")));
        setContent(fullPost.content ?? "");
        setImageUrl(fullPost.imageUrl ?? "");
        setLoading(false);
      } catch (e) {
        debug.push(`Genel hata: ${e instanceof Error ? e.message : e}`);
        setDebugInfo(debug.join(" | "));
        setError(e instanceof Error ? e.message : "Yazı yüklenemedi.");
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function onPickImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    try { const { url } = await uploadImage(file); setImageUrl(url); }
    catch (e) { setError(e instanceof Error ? e.message : "Yükleme başarısız."); }
    finally { setUploading(false); }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      // Güncelleme ID'si: foundPost.id > URL param > id
      const updateId = foundPost?.id ?? id;
      await updatePost(String(updateId), {
        title:    title.trim(),
        excerpt:  excerpt.trim(),
        category,
        content:  content.trim(),
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

  const isDaily = category === "GÜNLÜK";
  const canSave =
    !!title.trim() &&
    !!content.trim() &&
    (isDaily || !!excerpt.trim());

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-sm text-slate-400">Yazı yükleniyor…</span>
      </div>
    );
  }

  /* ── Error / Not found ── */
  if (error && !foundPost) {
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

  /* ── Edit form ── */
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-1">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition">
          <ArrowLeft className="h-4 w-4" />Admin Paneli
        </Link>
        <div className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          Yazı Düzenle
        </div>
        <h1 className="text-2xl font-black text-slate-50">Yazıyı Düzenle</h1>
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400">Başlık <span className="text-rose-400">*</span></label>
              <input value={title} onChange={e => setTitle(e.target.value)} className={inp} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400">
                Özet {!isDaily ? <span className="text-rose-400">*</span> : <span className="text-slate-500">(GÜNLÜK: isteğe bağlı)</span>}
              </label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} className={`${inp} resize-none`} required={!isDaily} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Kategori</label>
              <div className="flex gap-2">
                {(["TECH", "ACADEMIC", "GÜNLÜK"] as PostCategory[]).map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      category === cat
                        ? cat === "TECH"     ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                        : cat === "ACADEMIC" ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        :                     "border-rose-500 bg-rose-500/20 text-rose-300"
                        : "border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Görsel URL</label>
              <div className="flex gap-2">
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  className={`${inp} flex-1`} placeholder="https://..." />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition">
                  {uploading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" /> : <UploadCloud className="h-4 w-4" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => void onPickImage(e.target.files?.[0] ?? null)} />
              </div>
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Önizleme" className="h-20 w-full rounded-xl object-cover border border-slate-700" />
              )}
            </div>
          </div>
        </div>

        {/* Markdown editor */}
        <div className="overflow-hidden rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between border-b border-slate-700/60 bg-slate-900/60 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              İçerik (Markdown) <span className="text-rose-400">*</span>
            </span>
            <div className="flex gap-1">
              {([
                { m: "edit"    as EditorMode, icon: <Pencil className="h-3.5 w-3.5" />,               label: "Düzenle" },
                { m: "split"   as EditorMode, icon: <SplitSquareHorizontal className="h-3.5 w-3.5" />, label: "İkili"   },
                { m: "preview" as EditorMode, icon: <Eye className="h-3.5 w-3.5" />,                  label: "Önizle"  },
              ] as const).map(({ m, icon, label }) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    mode === m ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}>
                  {icon}<span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div data-color-mode="dark">
            {mode === "preview" ? (
              <div className="min-h-[400px] bg-slate-900 p-6">
                <div className="blog-prose">
                  <MDPreview source={content || "_Henüz içerik girilmedi._"} />
                </div>
              </div>
            ) : (
              <MDEditor value={content} onChange={v => setContent(v ?? "")} height={400}
                preview={mode === "edit" ? "edit" : "live"}
                style={{ background: "transparent", border: "none", borderRadius: 0 }} />
            )}
          </div>
          <div className="border-t border-slate-700/60 bg-slate-900/40 px-4 py-2">
            <p className="text-[11px] leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-400">İçerikte görsel</span>: Yerel yol (C:\…) yazılamaz.
              Kapak alanından <span className="text-slate-400">Yükle</span> ile görseli yükle, dönen URL’yi{" "}
              <code className="rounded bg-slate-800 px-1 text-slate-300">![açıklama](URL)</code> içine yapıştır.
            </p>
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
          <button type="submit" disabled={saving || !canSave}
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
