import Link from "next/link";
import { ArrowUpRight, Clock, Image as ImageIcon } from "lucide-react";
import type { Post } from "@/lib/api";
import { formatCreatedUpdatedLine } from "@/lib/dates";
import { normalizePostCategory } from "@/lib/postCategory";

const CAT: Record<string, string> = {
  TECH:     "border-indigo-500/40 bg-indigo-500/15 text-indigo-400",
  ACADEMIC: "border-emerald-500/40 bg-emerald-500/15 text-emerald-500",
  GÜNLÜK:   "border-rose-500/40 bg-rose-500/15 text-rose-400",
};

export default function PostCard({ post }: { post: Post }) {
  const excerpt =
    post.excerpt?.trim() ||
    post.content?.replace(/[#*_`>-]/g, "").slice(0, 130) ||
    "Özet henüz eklenmemiş.";
  const catKey = normalizePostCategory(post.category);
  const catCls = CAT[catKey] ?? CAT.TECH;
  const dateLine = formatCreatedUpdatedLine(
    post.createdAt,
    post.updatedAt,
    post.date,
  );

  return (
    <Link href={`/blog/${post.slug}`} className="block h-full">
      <article
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          background: "rgb(var(--surface))",
          borderColor: "rgb(var(--surface2))",
          boxShadow: "0 0 0 1px transparent",
        }}
      >
        {/* Shine sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/8 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        {/* Cover */}
        <div
          className="relative aspect-[16/9] w-full overflow-hidden"
          style={{ background: "rgb(var(--surface2))" }}
        >
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.05]"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <span className={`absolute left-3 top-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${catCls}`}>
            {catKey}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3
            className="text-base font-bold leading-snug transition-colors"
            style={{ color: "rgb(var(--t1))" }}
          >
            {post.title}
          </h3>

          <p className="flex-1 text-sm leading-6 line-clamp-3" style={{ color: "rgb(var(--t3))" }}>
            {excerpt}
          </p>

          {(post.tags ?? []).length ? (
            <div className="flex flex-wrap gap-1.5">
              {(post.tags ?? []).slice(0, 3).map(t => (
                <span
                  key={t}
                  className="rounded-full border px-2 py-0.5 text-[11px]"
                  style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
                >
                  #{t}
                </span>
              ))}
            </div>
          ) : null}

          <div
            className="flex items-center justify-between border-t pt-3 text-xs"
            style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              {dateLine && (
                <span className="line-clamp-2 leading-relaxed" title={dateLine}>
                  {dateLine}
                </span>
              )}
              {post.readTimeMinutes && (
                <span className="flex shrink-0 items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTimeMinutes} dk
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Oku <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
