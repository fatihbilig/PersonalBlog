"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

export default function HomeDateClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm"
      style={{
        background: "rgb(var(--surface))",
        borderColor: "rgb(var(--surface2))",
        color: "rgb(var(--t2))",
      }}
    >
      <span className="flex items-center gap-2 font-medium" style={{ color: "rgb(var(--t1))" }}>
        <Calendar className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden />
        {dateStr}
      </span>
      <span
        className="flex items-center gap-2 font-mono text-sm tabular-nums tracking-tight"
        style={{ color: "rgb(var(--t3))" }}
      >
        <Clock className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
        {timeStr}
      </span>
      <span className="w-full text-right text-[11px] sm:w-auto sm:text-left" style={{ color: "rgb(var(--t-muted))" }}>
        Saat dilimi: İstanbul (UTC+3)
      </span>
    </div>
  );
}
