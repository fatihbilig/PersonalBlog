"use client";

import { useState } from "react";
import { User } from "lucide-react";

const SRC = "/images/about-portrait.png";

/**
 * Portre: `client/public/images/about-portrait.png` dosyasını ekleyin
 * (WhatsApp’tan indirdiğiniz fotoğrafı bu ada kopyalayın).
 */
export default function AboutPortrait() {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className="flex aspect-[3/4] w-full max-w-[220px] flex-col items-center justify-center gap-2 rounded-2xl border p-6 text-center text-xs"
        style={{
          borderColor: "rgb(var(--surface2))",
          background: "rgb(var(--surface2))",
          color: "rgb(var(--t3))",
        }}
      >
        <User className="h-10 w-10 opacity-40" aria-hidden />
        <span>
          Fotoğraf bulunamadı. Görseli şuraya ekleyin:{" "}
          <code className="rounded bg-black/20 px-1 py-0.5">public/images/about-portrait.png</code>
        </span>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[240px] shrink-0">
      <div
        className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-500/40 via-violet-500/30 to-emerald-500/25 blur-md"
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC}
        alt="Fatih Bilici"
        width={480}
        height={640}
        className="relative z-10 w-full rounded-2xl border object-cover object-top shadow-xl"
        style={{
          borderColor: "rgb(var(--surface2))",
          aspectRatio: "3 / 4",
        }}
        onError={() => setBroken(true)}
        loading="lazy"
      />
    </div>
  );
}
