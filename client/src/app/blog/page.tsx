import type { Metadata } from "next";
import { getPostsPagedForRsc } from "@/lib/api";
import {
  BLOG_PAGE_SIZE,
  parseBlogSearchParams,
} from "@/lib/blogQuery";
import BlogFeed from "@/components/BlogFeed";
import PostCard from "@/components/PostCard";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const { sayfa } = parseBlogSearchParams(sp);
  if (sayfa > 1) return { title: `Blog (sayfa ${sayfa}) | Fatih` };
  return { title: "Blog | Fatih" };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { sayfa, kategori, ara } = parseBlogSearchParams(sp);
  const categoryApi = kategori === "ALL" ? undefined : kategori;

  const [featuredBlock, listBlock] = await Promise.all([
    getPostsPagedForRsc({ page: 1, pageSize: 1 }),
    getPostsPagedForRsc({
      page: sayfa,
      pageSize: BLOG_PAGE_SIZE,
      category: categoryApi,
      search: ara || undefined,
    }),
  ]);

  const featured = featuredBlock.posts[0];
  const { posts, total, page, totalPages } = listBlock;
  const totalAll = featuredBlock.total;

  return (
    <div className="space-y-14">
      <header className="space-y-4">
        <Reveal>
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            Yazılar
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "rgb(var(--t1))" }}>
            Blog
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-xl text-sm leading-7" style={{ color: "rgb(var(--t3))" }}>
            Teknik notlar, akademik çalışmalar ve günlük gözlemler. Her yazı
            gerçek bir şeyi öğrenmenin ya da anlamanın ürünü.
          </p>
        </Reveal>
        <Reveal delay={0.13}>
          <div className="flex flex-wrap gap-2">
            {[
              { c: "TECH", cls: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400" },
              { c: "ACADEMIC", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" },
              { c: "GÜNLÜK", cls: "border-rose-500/40 bg-rose-500/10 text-rose-400" },
            ].map(({ c, cls }) => (
              <span key={c} className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{c}</span>
            ))}
            <span
              className="rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
            >
              {totalAll} yazı
            </span>
          </div>
        </Reveal>
      </header>

      {featured && (
        <section className="space-y-4">
          <Reveal><SectionTitle title="Öne Çıkan" subtitle="En güncel yayın." /></Reveal>
          <Reveal delay={0.06}>
            <div className="grid gap-4 lg:grid-cols-2">
              <PostCard post={featured} />
              <div
                className="flex flex-col justify-center rounded-2xl border p-6"
                style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--t-muted))" }}>
                  Bu blog hakkında
                </p>
                <p className="mt-3 text-sm leading-7" style={{ color: "rgb(var(--t2))" }}>
                  Solda her zaman en güncel yazı görünür. İçerikler{" "}
                  <span className="font-semibold text-indigo-400">TECH</span>,{" "}
                  <span className="font-semibold text-emerald-500">ACADEMIC</span> ve{" "}
                  <span className="font-semibold text-rose-400">GÜNLÜK</span>{" "}
                  kategorilerinde ayrışır. Aşağıda filtreleyebilir, arayabilir ve sayfalar arasında gezebilirsin.
                </p>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <section className="space-y-5">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <SectionTitle title="Tüm Yazılar" subtitle="Filtrele, ara veya sayfa seç." />
            <span className="text-sm" style={{ color: "rgb(var(--t-muted))" }}>
              {total} yazı
              {kategori !== "ALL" || ara ? " (filtreli)" : ""}
            </span>
          </div>
        </Reveal>
        <BlogFeed
          posts={posts}
          total={total}
          page={page}
          totalPages={totalPages}
          kategori={kategori}
          ara={ara}
        />
      </section>
    </div>
  );
}
