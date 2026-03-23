import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye, Tag } from "lucide-react";
import { getPostBySlugCached } from "@/lib/server-data";
import Reveal from "@/components/Reveal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CommentSection from "@/components/CommentSection";
import SharePost from "@/components/SharePost";
import { formatDisplayDate } from "@/lib/dates";

const CAT_CLS: Record<string, string> = {
  TECH:     "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
  ACADEMIC: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  GÜNLÜK:   "border-rose-500/40 bg-rose-500/15 text-rose-300",
};

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlugCached(slug).catch(() => null);
  if (!post) return notFound();

  const displayDate =
    formatDisplayDate(post.date ?? post.createdAt) ??
    post.date ??
    post.createdAt?.slice(0, 10) ??
    null;
  const updatedOnly =
    post.updatedAt &&
    post.createdAt &&
    new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime() + 60_000
      ? formatDisplayDate(post.updatedAt)
      : null;
  const catCls = CAT_CLS[post.category] ?? CAT_CLS.TECH;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Reveal>
        <Link href="/blog"
          className="inline-flex items-center gap-2 text-sm transition hover:text-indigo-400"
          style={{ color: "rgb(var(--t3))" }}>
          <ArrowLeft className="h-4 w-4" />
          Tüm yazılara dön
        </Link>
      </Reveal>

      <Reveal delay={0.04}>
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${catCls}`}>
              {post.category}
            </span>
            {displayDate && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgb(var(--t3))" }}>
                <Calendar className="h-3.5 w-3.5" />
                Yayın: {displayDate}
              </span>
            )}
            {updatedOnly && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgb(var(--t-muted))" }}>
                Güncelleme: {updatedOnly}
              </span>
            )}
            {post.readTimeMinutes && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgb(var(--t3))" }}>
                <Clock className="h-3.5 w-3.5" />{post.readTimeMinutes} dk okuma
              </span>
            )}
            {post.viewCount != null && (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgb(var(--t3))" }}>
                <Eye className="h-3.5 w-3.5" />{post.viewCount} görüntülenme
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl" style={{ color: "rgb(var(--t1))" }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base leading-7" style={{ color: "rgb(var(--t3))" }}>{post.excerpt}</p>
          )}

          {(post.tags ?? []).length ? (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5" style={{ color: "rgb(var(--t3))" }} />
              {(post.tags ?? []).map(t => (
                <span key={t} className="rounded-full border px-2.5 py-0.5 text-xs"
                  style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t3))" }}>
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
        </header>
      </Reveal>

      <Reveal delay={0.06}>
        <SharePost slug={slug} title={post.title} />
      </Reveal>

      {post.imageUrl && (
        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-3xl border" style={{ borderColor: "rgb(var(--surface2))" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt={post.title} className="h-72 w-full object-cover sm:h-96" />
          </div>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <article className="rounded-3xl border p-6 sm:p-8"
          style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}>
          <div className="blog-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content ?? "_Bu yazının içeriği henüz eklenmemiş._"}
            </ReactMarkdown>
          </div>
        </article>
      </Reveal>

      <Reveal delay={0.12}>
        <CommentSection postSlug={slug} />
      </Reveal>

      <Reveal delay={0.14}>
        <div className="flex justify-between border-t pt-8" style={{ borderColor: "rgb(var(--surface2))" }}>
          <Link href="/blog"
            className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:bg-slate-800"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t2))" }}>
            <ArrowLeft className="h-4 w-4" />Tüm yazılar
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
