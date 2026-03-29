"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import {
  deleteAdminComment,
  getAdminComments,
  patchAdminCommentReply,
  type AdminComment,
} from "@/lib/api";

const cardStyle = { background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" };

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminCommentsPage() {
  const [items, setItems] = useState<AdminComment[]>([]);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await getAdminComments();
      setItems(list);
      setReplyDraft(Object.fromEntries(list.map((i) => [i.id, i.authorReply ?? ""])));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yorumlar yüklenemedi.");
      setItems([]);
      setReplyDraft({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(c: AdminComment) {
    if (!confirm(`Bu yorumu silmek istiyor musun?\n\n"${c.body.slice(0, 80)}${c.body.length > 80 ? "…" : ""}"`)) return;
    try {
      await deleteAdminComment(c.id);
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      setReplyDraft((prev) => {
        const next = { ...prev };
        delete next[c.id];
        return next;
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Silinemedi.");
    }
  }

  async function saveReply(id: string, textOverride?: string) {
    setSavingId(id);
    try {
      const text = textOverride !== undefined ? textOverride : (replyDraft[id] ?? "");
      await patchAdminCommentReply(id, text);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Panele dön
          </Link>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <MessageCircle className="h-3.5 w-3.5" />
            Blog yorumları
          </div>
          <h1 className="mt-2 text-2xl font-black" style={{ color: "rgb(var(--t1))" }}>
            Yorum moderasyonu
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgb(var(--t3))" }}>
            Yorumları sil, yazara özel yanıt ekle (blogda görünür).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-slate-700 sm:self-auto"
          style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t2))" }}
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border" style={cardStyle}>
        <table className="w-full text-sm">
          <thead style={{ background: "rgb(var(--surface))" }}>
            <tr className="border-b" style={{ borderColor: "rgb(var(--surface2))" }}>
              <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>
                Yorum
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold lg:table-cell" style={{ color: "rgb(var(--t3))" }}>
                Yazı
              </th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold md:table-cell" style={{ color: "rgb(var(--t3))" }}>
                Tarih
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center" style={{ color: "rgb(var(--t3))" }}>
                  Yükleniyor…
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center" style={{ color: "rgb(var(--t3))" }}>
                  Henüz yorum yok.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <Fragment key={c.id}>
                  <tr className="align-top transition hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold" style={{ color: "rgb(var(--t1))" }}>
                        {c.authorName}
                      </div>
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed md:text-sm" style={{ color: "rgb(var(--t2))" }}>
                        {c.body}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "rgb(var(--t3))" }}>
                        <span>
                          👍 {c.reactions?.thumb ?? 0} · 💡 {c.reactions?.bulb ?? 0} · ❤️ {c.reactions?.heart ?? 0}
                        </span>
                        <span className="md:hidden">{formatDate(c.createdAt)}</span>
                      </div>
                      <div className="mt-2 lg:hidden">
                        <Link
                          href={`/blog/${encodeURIComponent(c.postSlug)}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          {c.postTitle}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <Link
                        href={`/blog/${encodeURIComponent(c.postSlug)}`}
                        className="inline-flex max-w-[200px] items-start gap-1 font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        <span className="line-clamp-2">{c.postTitle}</span>
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-xs md:table-cell" style={{ color: "rgb(var(--t3))" }}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void onDelete(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="bg-slate-950/40" style={{ borderColor: "rgb(var(--surface2))" }}>
                    <td colSpan={4} className="px-4 pb-4 pt-0">
                      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 sm:p-4">
                        <div className="mb-2 text-xs font-semibold text-indigo-300">Yazar yanıtı (blogda gösterilir)</div>
                        <textarea
                          value={replyDraft[c.id] ?? ""}
                          onChange={(e) =>
                            setReplyDraft((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                          rows={3}
                          className="mb-2 w-full resize-y rounded-xl border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-indigo-500/50"
                          style={{ color: "rgb(var(--t1))" }}
                          placeholder="Yanıtını yaz… (boş bırakıp kaydedersen yanıt kaldırılır)"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={savingId === c.id}
                            onClick={() => void saveReply(c.id)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                          >
                            {savingId === c.id ? "Kaydediliyor…" : "Yanıtı kaydet"}
                          </button>
                          <button
                            type="button"
                            disabled={savingId === c.id}
                            onClick={() => {
                              setReplyDraft((prev) => ({ ...prev, [c.id]: "" }));
                              void saveReply(c.id, "");
                            }}
                            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                          >
                            Yanıtı kaldır
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
