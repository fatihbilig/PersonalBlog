"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Image as ImageIcon } from "lucide-react";
import type { Post } from "@/lib/api";
import { formatCreatedUpdatedLine } from "@/lib/dates";

const catColor: Record<string, string> = {
  TECH:     "border-indigo-500/40 bg-indigo-500/15 text-indigo-400",
  ACADEMIC: "border-emerald-500/40 bg-emerald-500/15 text-emerald-500",
  GÜNLÜK:   "border-rose-500/40 bg-rose-500/15 text-rose-400",
};

type BlogSliderProps = {
  posts: Post[];
  /** stack: büyük görsel üstte; row: görsel solda, metin sağda (hero yatay düzen) */
  layout?: "stack" | "row";
};

export default function BlogSlider({ posts, layout = "stack" }: BlogSliderProps) {
  const [idx, setIdx] = useState(0);
  const total = posts.length;
  if (!total) return null;

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(total - 1, i + 1));

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(.32,1,.6,1)]"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {posts.map(post => {
            const cls = catColor[post.category] ?? catColor.TECH;
            const dateLine = formatCreatedUpdatedLine(
              post.createdAt,
              post.updatedAt,
              post.date,
            );

            if (layout === "row") {
              return (
                <div key={post.id} className="min-w-full">
                  <Link href={`/blog/${post.slug}`} prefetch={false}>
                    <div
                      className="group flex min-h-[7.5rem] overflow-hidden rounded-2xl border sm:min-h-[8rem]"
                      style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))" }}
                    >
                      <div
                        className="relative h-auto w-[7.25rem] shrink-0 overflow-hidden sm:w-36"
                        style={{ background: "rgb(var(--surface2))", minHeight: "7.5rem" }}
                      >
                        {post.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgb(var(--surface)) 0%, rgb(var(--surface2)) 100%)",
                            }}
                          >
                            <ImageIcon className="h-8 w-8 opacity-30" style={{ color: "rgb(var(--t3))" }} />
                          </div>
                        )}
                      </div>
                      <div
                        className="flex min-w-0 flex-1 flex-col justify-center gap-1 border-l px-3 py-2.5 sm:px-4 sm:py-3"
                        style={{ borderColor: "rgb(var(--surface2))" }}
                      >
                        <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
                          {post.category}
                        </span>
                        <h3
                          className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-indigo-400 sm:text-base"
                          style={{ color: "rgb(var(--t1))" }}
                        >
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="line-clamp-2 text-xs" style={{ color: "rgb(var(--t3))" }}>
                            {post.excerpt}
                          </p>
                        )}
                        <div
                          className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px]"
                          style={{ color: "rgb(var(--t-muted))" }}
                        >
                          {dateLine && <span className="line-clamp-1">{dateLine}</span>}
                          {post.readTimeMinutes && (
                            <span className="flex shrink-0 items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTimeMinutes} dk
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            }

            return (
              <div key={post.id} className="min-w-full">
                <Link href={`/blog/${post.slug}`} prefetch={false}>
                  <div
                    className="group relative overflow-hidden rounded-2xl border"
                    style={{ borderColor: "rgb(var(--surface2))" }}
                  >
                    <div
                      className="relative h-56 w-full overflow-hidden sm:h-64 md:h-72"
                      style={{ background: "rgb(var(--surface2))" }}
                    >
                      {post.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, rgb(var(--surface)) 0%, rgb(var(--surface2)) 100%)",
                          }}
                        >
                          <ImageIcon className="h-10 w-10 opacity-30" style={{ color: "rgb(var(--t3))" }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
                        {post.category}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug text-white line-clamp-2 group-hover:text-indigo-200 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/70">{post.excerpt}</p>
                      )}
                      <div className="mt-2 flex flex-col gap-1 text-[11px] text-white/55 sm:flex-row sm:items-center sm:gap-3">
                        {dateLine && <span className="line-clamp-2">{dateLine}</span>}
                        {post.readTimeMinutes && (
                          <span className="flex shrink-0 items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTimeMinutes} dk
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {posts.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === idx ? "w-8 bg-indigo-500" : "w-2 hover:bg-slate-500"
              }`}
              style={i !== idx ? { background: "rgb(var(--surface2))" } : undefined}
              aria-label={`Yazı ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={idx === 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border transition hover:bg-slate-700 disabled:opacity-30"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t2))" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={idx === total - 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border transition hover:bg-slate-700 disabled:opacity-30"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t2))" }}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
