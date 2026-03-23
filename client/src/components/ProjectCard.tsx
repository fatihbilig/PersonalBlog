import Link from "next/link";
import {
  ArrowUpRight, Brain, Database, ExternalLink, Github,
  Globe, Image as ImageIcon, Lock, QrCode, Server, Shield,
} from "lucide-react";
import type { Project } from "@/lib/api";
import { formatCreatedUpdatedLine } from "@/lib/dates";

function TechIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  const Icon =
    n.includes("next") || n.includes("react") ? Globe
    : n.includes("fastapi") || n.includes("node") || n.includes("server") ? Server
    : n.includes("postgres") || n.includes("sqlite") || n.includes("db") ? Database
    : n.includes("nlp") || n.includes("transformer") || n.includes("sbert") ? Brain
    : n.includes("security") || n.includes("phishing") ? Shield
    : n.includes("qr") ? QrCode
    : n.includes("auth") || n.includes("crypto") ? Lock
    : ArrowUpRight;
  return <Icon className="h-3 w-3" />;
}

function Pill({ href, label }: { href: string; label: string }) {
  const isGit = label.toLowerCase().includes("github");
  return (
    <Link
      href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition hover:text-slate-50"
      style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
    >
      {isGit ? <Github className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
      {label}
    </Link>
  );
}

export default function ProjectCard({ project }: { project: Project }) {
  const tech       = project.tech       ?? [];
  const links      = project.links      ?? [];
  const highlights = project.highlights ?? [];
  const dateLine = formatCreatedUpdatedLine(
    project.createdAt,
    project.updatedAt,
    null,
    "project",
  );

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
    >
      {/* Shine */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {/* Cover */}
      <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: "rgb(var(--surface2))" }}>
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl} alt={project.title}
            className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgb(var(--surface2)) 0%, rgb(var(--surface)) 100%)" }}
          >
            <ImageIcon className="h-8 w-8 opacity-30" style={{ color: "rgb(var(--t3))" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base font-bold transition-colors" style={{ color: "rgb(var(--t1))" }}>
          {project.title}
        </h3>

        <p className="flex-1 text-sm leading-6" style={{ color: "rgb(var(--t3))" }}>
          {project.summary ?? "Açıklama eklenmemiş."}
        </p>

        {tech.length ? (
          <div className="flex flex-wrap gap-1.5">
            {tech.slice(0, 5).map(t => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px]"
                style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
                title={t}
              >
                <TechIcon name={t} /> {t}
              </span>
            ))}
          </div>
        ) : null}

        {highlights.length ? (
          <ul className="space-y-1">
            {highlights.slice(0, 2).map(h => (
              <li key={h} className="flex gap-2 text-xs" style={{ color: "rgb(var(--t3))" }}>
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                {h}
              </li>
            ))}
          </ul>
        ) : null}

        {dateLine && (
          <div
            className="border-t pt-3 text-[11px] leading-relaxed"
            style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t-muted))" }}
          >
            {dateLine}
          </div>
        )}

        {links.length ? (
          <div className="flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "rgb(var(--surface2))" }}>
            {links.map(l => <Pill key={l.href} href={l.href} label={l.label} />)}
          </div>
        ) : null}
      </div>
    </article>
  );
}
