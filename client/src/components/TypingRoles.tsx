"use client";

import { useEffect, useMemo, useState } from "react";

const roles = ["Backend Developer", "AI & NLP Enthusiast"] as const;

export default function TypingRoles() {
  const sequence = useMemo(() => roles.map(String), []);
  const [idx,      setIdx]      = useState(0);
  const [sub,      setSub]      = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current    = sequence[idx] ?? "";
    const doneTyping = sub >= current.length;
    const empty      = sub <= 0;
    const speed      = deleting ? 28 : 40;
    const delay      = (doneTyping && !deleting ? 900 : 0) || speed;

    const t = window.setTimeout(() => {
      if (!deleting) {
        if (!doneTyping) setSub(s => s + 1);
        else setDeleting(true);
      } else {
        if (!empty) setSub(s => s - 1);
        else { setDeleting(false); setIdx(i => (i + 1) % sequence.length); }
      }
    }, delay);

    return () => window.clearTimeout(t);
  }, [deleting, idx, sequence, sub]);

  const text = (sequence[idx] ?? "").slice(0, sub);

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-bold" style={{ color: "rgb(var(--t1))" }}>Fatih</span>
      <span style={{ color: "rgb(var(--t-muted))" }}>•</span>
      <span className="min-w-[18ch]" style={{ color: "rgb(var(--t2))" }}>
        {text}
        <span
          className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] rounded-full animate-pulse"
          style={{ background: "rgb(var(--a1))" }}
        />
      </span>
    </span>
  );
}
