"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Send, User } from "lucide-react";
import {
  getComments,
  reactToPostComment,
  submitComment,
  type PostComment,
  type ReactionKind,
} from "@/lib/api";

const REACTIONS: { kind: ReactionKind; emoji: string; label: string }[] = [
  { kind: "THUMB", emoji: "👍", label: "Beğeni" },
  { kind: "BULB", emoji: "💡", label: "Fikir" },
  { kind: "HEART", emoji: "❤️", label: "Sevgi" },
];

function formatCommentDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatReplyDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function reactionStorageKey(postSlug: string) {
  return `comment-reactions-v2-${postSlug}`;
}

function readReactionMap(postSlug: string): Record<string, ReactionKind> {
  try {
    const raw = window.localStorage.getItem(reactionStorageKey(postSlug));
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return {};
    const out: Record<string, ReactionKind> = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === "THUMB" || v === "BULB" || v === "HEART") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeReactionMap(postSlug: string, map: Record<string, ReactionKind>) {
  try {
    window.localStorage.setItem(reactionStorageKey(postSlug), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [reactionMap, setReactionMap] = useState<Record<string, ReactionKind>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [reactingId, setReactingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    setLoadingList(true);
    try {
      const list = await getComments(postSlug);
      setComments(list);
    } catch {
      setLoadError(
        "Yorumlar yüklenemedi. API ve veritabanını kontrol et (Comment: reaction + yazar yanıtı sütunları).",
      );
      setComments([]);
    } finally {
      setLoadingList(false);
    }
  }, [postSlug]);

  useEffect(() => {
    setReactionMap(readReactionMap(postSlug));
  }, [postSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSendError(null);
    setSending(true);
    try {
      const created = await submitComment(postSlug, {
        name: name.trim(),
        text: text.trim(),
      });
      setComments(prev => [...prev, created]);
      setName("");
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  async function onReact(commentId: string, type: ReactionKind) {
    if (reactingId) return;
    const prev = reactionMap[commentId];
    setReactingId(commentId);
    try {
      const updated = await reactToPostComment(
        postSlug,
        commentId,
        prev !== undefined ? { type, previousType: prev } : { type },
      );
      const nextMap = { ...reactionMap };
      if (prev === type) {
        delete nextMap[commentId];
      } else {
        nextMap[commentId] = type;
      }
      setReactionMap(nextMap);
      writeReactionMap(postSlug, nextMap);
      setComments(prev =>
        prev.map(c => (c.id === commentId ? updated : c)),
      );
    } catch {
      /* sessiz */
    } finally {
      setReactingId(null);
    }
  }

  function reactionCount(c: PostComment, kind: ReactionKind): number {
    const r = c.reactions;
    if (!r) return 0;
    if (kind === "THUMB") return r.thumb ?? 0;
    if (kind === "BULB") return r.bulb ?? 0;
    return r.heart ?? 0;
  }

  const inp = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20`;
  const inpStyle = { background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))", color: "rgb(var(--t1))" };

  return (
    <section className="space-y-6 rounded-3xl border p-6 sm:p-8"
      style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}>
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-indigo-400" />
        <h2 className="text-base font-bold" style={{ color: "rgb(var(--t1))" }}>
          Yorumlar
          {!loadingList && comments.length > 0 && (
            <span className="ml-2 rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {loadError}
        </div>
      )}

      <div className="space-y-4">
        {loadingList ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm"
            style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}>
            Yorumlar yükleniyor…
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm"
            style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}>
            Henüz yorum yok. İlk yorumu sen yap! 🎉
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="space-y-3">
              <div className="flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-300" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>{c.name}</span>
                    <span className="text-[11px]" style={{ color: "rgb(var(--t3))" }}>
                      {formatCommentDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-6" style={{ color: "rgb(var(--t2))" }}>{c.text}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {REACTIONS.map(({ kind, emoji, label }) => {
                      const active = reactionMap[c.id] === kind;
                      const n = reactionCount(c, kind);
                      const busy = reactingId === c.id;
                      return (
                        <button
                          key={kind}
                          type="button"
                          disabled={busy}
                          title={label}
                          onClick={() => void onReact(c.id, kind)}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
                            active
                              ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-200"
                              : "border-transparent bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                          }`}
                          style={!active ? { borderColor: "rgb(var(--surface2))" } : undefined}
                        >
                          <span className="text-base leading-none">{emoji}</span>
                          <span>{n > 0 ? n : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {c.authorReply?.trim() && (
                <div
                  className="ml-0 rounded-2xl border border-indigo-500/25 bg-indigo-500/5 px-4 py-3 sm:ml-12"
                  style={{ borderColor: "rgba(99,102,241,0.25)" }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-400">
                      Yazar yanıtı
                    </span>
                    {c.authorRepliedAt && (
                      <span className="text-[10px]" style={{ color: "rgb(var(--t3))" }}>
                        {formatReplyDate(c.authorRepliedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgb(var(--t2))" }}>
                    {c.authorReply}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={e => void onSubmit(e)} className="space-y-3 border-t pt-5"
        style={{ borderColor: "rgb(var(--surface2))" }}>
        <div className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>
          Yorum yap
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className={inp}
          style={inpStyle}
          placeholder="Adın"
          required
        />
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className={`${inp} min-h-24 resize-none`}
          style={inpStyle}
          placeholder="Düşüncelerini paylaş…"
          required
        />
        {sendError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {sendError}
          </div>
        )}
        {sent && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            ✅ Yorumun kaydedildi!
          </div>
        )}
        <button
          type="submit"
          disabled={sending || loadingList}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {sending ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>
    </section>
  );
}
