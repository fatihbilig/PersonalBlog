"use client";

import { motion } from "framer-motion";

export default function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-lg font-bold" style={{ color: "rgb(var(--t1))" }}>{title}</h2>
      {subtitle ? <p className="text-sm" style={{ color: "rgb(var(--t3))" }}>{subtitle}</p> : null}
      <motion.div
        className="h-px w-full bg-gradient-to-r from-indigo-500/60 via-violet-500/30 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "0% 50%" }}
      />
    </div>
  );
}
