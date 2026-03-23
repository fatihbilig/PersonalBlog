"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, ThumbsUp, User } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  text: string;
  date: string;
  likes: number;
}

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const key = `comments-${postSlug}`;
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName]   = useState("");
  const [text, setText]   = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]   = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) setComments(JSON.parse(stored) as Comment[]);
      } catch {
        /* ignore */
      }
    });
  }, [key]);

  function save(list: Comment[]) {
    setComments(list);
    try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newComment: Comment = {
        id: Date.now().toString(),
        name: name.trim(),
        text: text.trim(),
        date: new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }),
        likes: 0,
      };
      save([...comments, newComment]);
      setName(""); setText(""); setSending(false); setSent(true);
      setTimeout(() => setSent(false), 2500);
    }, 600);
  }

  function like(id: string) {
    save(comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
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
          {comments.length > 0 && (
            <span className="ml-2 rounded-full bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {/* Comment list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm"
            style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}>
            Henüz yorum yok. İlk yorumu sen yap! 🎉
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-3 group">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-300" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>{c.name}</span>
                  <span className="text-[11px]" style={{ color: "rgb(var(--t3))" }}>{c.date}</span>
                </div>
                <p className="text-sm leading-6" style={{ color: "rgb(var(--t2))" }}>{c.text}</p>
                <button
                  type="button"
                  onClick={() => like(c.id)}
                  className="inline-flex items-center gap-1.5 text-xs transition hover:text-indigo-400"
                  style={{ color: "rgb(var(--t3))" }}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {c.likes > 0 ? c.likes : "Beğen"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-3 border-t pt-5"
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
          ref={textRef}
          value={text}
          onChange={e => setText(e.target.value)}
          className={`${inp} min-h-24 resize-none`}
          style={inpStyle}
          placeholder="Düşüncelerini paylaş…"
          required
        />
        {sent && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            ✅ Yorumun eklendi!
          </div>
        )}
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {sending ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>
    </section>
  );
}
