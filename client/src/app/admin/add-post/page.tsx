"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, SplitSquareHorizontal, UploadCloud } from "lucide-react";
import { createPost, uploadImage, type PostCategory } from "@/lib/api";
import { parseCategoryFromQuery } from "@/lib/postCategory";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDPreview = dynamic(
  () => import("@uiw/react-md-editor").then((m) => m.default.Markdown),
  { ssr: false },
);

type EditorMode = "edit" | "preview" | "split";

function AddPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<PostCategory>("TECH");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("split");

  useEffect(() => {
    const next = parseCategoryFromQuery(searchParams.get("category"));
    if (next) setCategory(next);
  }, [searchParams]);

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content],
  );
  const readMinutes = Math.max(1, Math.round(wordCount / 200));

  /** Günlük yazılar genelde kısa olur; aynı engeli kaldır */
  const isDaily = category === "GÜNLÜK";
  const minTitle = isDaily ? 2 : 3;
  const minExcerpt = isDaily ? 1 : 10;
  const minContent = isDaily ? 1 : 10;

  const canSubmit =
    title.trim().length >= minTitle &&
    excerpt.trim().length >= minExcerpt &&
    content.trim().length >= minContent &&
    !loading;

  async function onPickImage(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createPost({
        title: title.trim(),
        excerpt: excerpt.trim(),
        category,
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Yazı eklenemedi. Token geçerli mi?",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
          Admin · Yeni Yazı
        </div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: "rgb(var(--t1))" }}>
          Yeni Yazı Oluştur
        </h1>
        {category === "GÜNLÜK" ? (
          <p className="text-sm" style={{ color: "rgb(var(--t3))" }}>
            Günlük kategorisi seçili — blogdaki GÜNLÜK sekmesiyle uyumlu yayınlanır. Kısa notlar için özet ve
            içerik minimumu gevşetildi (en az 1 karakter).
          </p>
        ) : null}
      </header>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Meta bilgiler */}
        <div className="rounded-2xl border p-5 space-y-4"
          style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgb(var(--t3))" }}>
            Temel Bilgiler
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Başlık */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium" style={{ color: "rgb(var(--t2))" }}>
                Başlık <span className="text-rose-400">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none placeholder:opacity-40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/25 transition"
                style={{ background: "rgb(var(--surface2))", borderColor: "rgb(var(--border))", color: "rgb(var(--t1))" }}
                placeholder="Örn: Next.js ile Full-Stack Blog Yazmak"
                required
                minLength={minTitle}
              />
            </div>

            {/* Özet */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium" style={{ color: "rgb(var(--t2))" }}>
                Kısa Özet <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none placeholder:opacity-40 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/25 transition"
                style={{ background: "rgb(var(--surface2))", borderColor: "rgb(var(--border))", color: "rgb(var(--t1))" }}
                placeholder="Yazının 1-2 cümlelik özeti..."
                required={!isDaily}
                minLength={isDaily ? undefined : 10}
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "rgb(var(--t2))" }}>Kategori</label>
              <div className="flex gap-2">
                {(["TECH", "ACADEMIC", "GÜNLÜK"] as PostCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      category === cat
                        ? cat === "TECH"     ? "border-indigo-500 bg-indigo-500/20 text-indigo-400"
                        : cat === "ACADEMIC" ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                        :                     "border-rose-500 bg-rose-500/20 text-rose-400"
                        : "hover:brightness-125"
                    }`}
                    style={category === cat ? undefined : { borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Görsel */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "rgb(var(--t2))" }}>
                Kapak Görseli
              </label>
              <div className="flex gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none placeholder:opacity-40 focus:border-indigo-500/60 transition"
                  style={{ background: "rgb(var(--surface2))", borderColor: "rgb(var(--border))", color: "rgb(var(--t1))" }}
                  placeholder="https://... veya dosya seç →"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition"
                  style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
                >
                  <UploadCloud className="h-4 w-4" />
                  {uploading ? "Yükleniyor…" : "Yükle"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
                />
              </div>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Önizleme"
                  className="h-24 w-full rounded-xl object-cover border"
                  style={{ borderColor: "rgb(var(--surface2))" }}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Markdown editör */}
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "rgb(var(--surface2))" }}>
          {/* Editör toolbar */}
          <div className="flex items-center justify-between border-b px-4 py-2"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))" }}>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                İçerik (Markdown)
              </span>
              <span className="text-rose-400 ml-0.5 text-xs">*</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-2">
                ~{readMinutes} dk · {wordCount} kelime
              </span>
              {(
                [
                  { mode: "edit" as EditorMode, icon: <Pencil className="h-3.5 w-3.5" />, label: "Düzenle" },
                  { mode: "split" as EditorMode, icon: <SplitSquareHorizontal className="h-3.5 w-3.5" />, label: "İkili" },
                  { mode: "preview" as EditorMode, icon: <Eye className="h-3.5 w-3.5" />, label: "Önizle" },
                ] as const
              ).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEditorMode(mode)}
                  title={label}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    editorMode === mode
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editör alanı */}
          <div data-color-mode="dark">
            {editorMode === "preview" ? (
              <div className="min-h-[480px] p-6">
                <div className="prose prose-invert prose-slate max-w-none prose-headings:tracking-tight prose-a:text-sky-400 prose-code:rounded prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-pre:rounded-2xl prose-pre:bg-slate-950 prose-img:rounded-2xl">
                  <MDPreview
                    source={content || "_Henüz içerik girilmedi._"}
                  />
                </div>
              </div>
            ) : editorMode === "edit" ? (
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? "")}
                height={480}
                preview="edit"
                hideToolbar={false}
                style={{ background: "transparent", borderRadius: 0, border: "none" }}
              />
            ) : (
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? "")}
                height={480}
                preview="live"
                hideToolbar={false}
                style={{ background: "transparent", borderRadius: 0, border: "none" }}
              />
            )}
          </div>

          {/* Markdown ipuçları */}
          <div className="space-y-1.5 border-t px-4 py-2"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))" }}>
            <p className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Markdown</span>: **kalın**, *italik*, `kod`, [link](url),
              # Başlık, ## Alt Başlık, - Liste, ```kod bloğu```
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-400">İçerikte görsel</span>: Bilgisayarındaki dosya yolunu veya sadece uzantıyı yazma — çalışmaz.
              Önce yukarıdan <span className="text-slate-400">Kapak Görseli → Yükle</span> ile yükle, çıkan{" "}
              <code className="rounded bg-slate-800 px-1 text-slate-300">https://.../uploads/....jpg</code> adresini kopyala;
              içerikte <code className="rounded bg-slate-800 px-1 text-slate-300">![açıklama](YAPIŞTIRDIĞIN_URL)</code> kullan.
            </p>
          </div>
        </div>

        {/* Hata mesajı */}
        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {/* Aksiyonlar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full border px-6 py-2.5 text-sm font-semibold transition hover:brightness-110"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t1))" }}
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 disabled:opacity-50 transition"
          >
            {loading ? "Kaydediliyor…" : "Yazıyı Yayınla"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddPostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-sm text-slate-400">Form yükleniyor…</span>
        </div>
      }
    >
      <AddPostForm />
    </Suspense>
  );
}
