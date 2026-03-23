"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

export default function ParallaxCover({
  imageUrl,
  title,
}: {
  imageUrl?: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [20, -40]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.08]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-black/10 bg-slate-950 shadow-sm dark:border-white/10"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt={title}
          style={{ y, scale }}
          className="h-64 w-full object-cover sm:h-80"
        />
      ) : (
        <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-slate-950 via-zinc-950/60 to-slate-950 sm:h-80">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
            <ImageIcon className="h-4 w-4" />
            Görsel yok
          </div>
        </div>
      )}
    </div>
  );
}

