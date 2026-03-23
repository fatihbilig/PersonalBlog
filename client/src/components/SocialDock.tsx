"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";

const items = [
  {
    label: "YouTube",
    href:  "https://www.youtube.com/@fatihbilig",
    Icon:  Youtube,
    color: "text-red-400 group-hover:text-red-300",
  },
  {
    label: "Instagram",
    href:  "https://www.instagram.com/thebilicii/",
    Icon:  Instagram,
    color: "text-pink-400 group-hover:text-pink-300",
  },
  {
    label: "LinkedIn",
    href:  "https://www.linkedin.com/in/fatih-bilici-a26a3b252/",
    Icon:  Linkedin,
    color: "text-blue-400 group-hover:text-blue-300",
  },
] as const;

const dockShell: CSSProperties = {
  borderColor: "rgb(var(--surface2))",
  background: "color-mix(in srgb, rgb(var(--surface)) 92%, transparent)",
  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.2)",
};

const dockBtn: CSSProperties = {
  borderColor: "rgb(var(--surface2))",
  background: "rgb(var(--surface2))",
};

export default function SocialDock() {
  return (
    <div className="scroll-top-btn">
      <div
        className="flex flex-col gap-2 rounded-2xl border p-2 backdrop-blur-md transition-[background,border-color] duration-300"
        style={dockShell}
      >
        {items.map(({ href, label, Icon, color }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg"
            style={dockBtn}
            aria-label={label}
            title={label}
          >
            <Icon className={`h-5 w-5 transition ${color}`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
