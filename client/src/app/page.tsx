import Link from "next/link";
import { ArrowRight, BookOpen, FolderGit2, Rss, Sparkles, TrendingUp } from "lucide-react";
import { getPostsCached, getProjectsCached } from "@/lib/server-data";
import type { Post } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import PostCard from "@/components/PostCard";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import TypingRoles from "@/components/TypingRoles";
import TechBento from "@/components/TechBento";
import BlogSlider from "@/components/BlogSlider";
import HomeHeroSlider from "@/components/HomeHeroSlider";
import HomeDateClock from "@/components/HomeDateClock";

export const dynamic = "force-dynamic";

function pickInterestingPosts(all: Post[], excludeIds: Set<string>, limit = 6): Post[] {
  const pool = all.filter(p => !excludeIds.has(String(p.id)));
  const byViews = [...pool].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  const picked: Post[] = [];
  const seen = new Set<string>();
  for (const p of byViews) {
    if (picked.length >= limit) break;
    picked.push(p);
    seen.add(String(p.id));
  }
  if (picked.length < limit) {
    const rest = [...pool].filter(p => !seen.has(String(p.id))).sort((a, b) => {
      const tb = new Date(b.updatedAt ?? b.createdAt ?? b.date ?? 0).getTime();
      const ta = new Date(a.updatedAt ?? a.createdAt ?? a.date ?? 0).getTime();
      return tb - ta;
    });
    for (const p of rest) {
      if (picked.length >= limit) break;
      picked.push(p);
    }
  }
  if (!picked.length && all.length) return all.slice(0, Math.min(limit, all.length));
  return picked;
}

export default async function Home() {
  const [projects, posts] = await Promise.all([getProjectsCached(), getPostsCached()]);
  const sliderPosts = posts.slice(0, 5);
  const latestPosts = posts.slice(0, 6);
  const featuredProjs = projects.slice(0, 6);
  const interestingPosts = pickInterestingPosts(
    posts,
    new Set(sliderPosts.map(p => String(p.id))),
    6,
  );

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20">
      {/* Üst: solda fotoğraf slider, sağda hero — lg+ flex ile net hizalama */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
        <Reveal className="w-full shrink-0 lg:w-[min(100%,380px)] xl:w-[min(100%,420px)] lg:max-w-[42%]">
          <HomeHeroSlider variant="column" />
        </Reveal>

        <section
          className="relative min-w-0 flex-1 overflow-hidden rounded-3xl border p-5 sm:p-7 lg:p-8"
          style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-16 h-60 w-60 rounded-full bg-violet-500/8 blur-3xl" />
          </div>

          <div className="relative space-y-5 md:space-y-6">
            {/* Başlık kartın tam genişliğinde, tek satır (dar ekranda clamp küçülür) */}
            <Reveal
              delay={0.05}
              className="block max-w-none w-[calc(100%+1rem)] -mr-4 sm:w-[calc(100%+1.5rem)] sm:-mr-6 lg:w-[calc(100%+2rem)] lg:-mr-8 xl:w-[calc(100%+2.5rem)] xl:-mr-10"
            >
              <h1
                className="inline-flex w-full max-w-none flex-row flex-nowrap items-baseline justify-start gap-x-2.5 whitespace-nowrap font-black leading-none tracking-tight sm:gap-x-3"
                style={{ fontSize: "clamp(1.2rem, 2.95vw + 0.5rem, 3.5rem)" }}
              >
                <span className="inline-block bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  Hoşgeldiniz 
                </span>
                <span className="inline-block shrink-0" style={{ color: "rgb(var(--t1))" }}>
                  
                </span>
              </h1>
            </Reveal>

          {/* Giriş metni | Son Yazılar: md+ yan yana */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-6 lg:gap-8">
          {/* Left */}
          <div className="min-w-0 space-y-4 md:space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
              <Reveal>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Blog · Projeler · Notlar
                </div>
              </Reveal>

              <Reveal delay={0.06}>
                <div className="min-w-0 text-sm font-medium" style={{ color: "rgb(var(--t3))" }}>
                  <TypingRoles />
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.17}>
              <p className="max-w-lg text-[0.9375rem] leading-relaxed md:leading-7" style={{ color: "rgb(var(--t2))" }}>
                Ölçeklenebilir Backend mimarileri, Veri Madenciliği , Derin öğrenme konuları, derin öğrenme tabanlı NLP çalışmaları ve
                siber güvenlik odaklı donanım projelerimi tek bir çatıda topluyorum.
                Üretim standartlarında geliştirdiğim projelerimi, akademik notlarımı ve
                teknolojiye dair günlük gözlemlerimi bu dijital arşivde bulabilirsin.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link href="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110">
                  <FolderGit2 className="h-4 w-4" />
                  Projelere bak <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Sağ: Son Yazılar üstte; altında Blog&apos;u oku + özet kartları */}
          <div className="flex min-w-0 flex-col gap-6 md:gap-7">
            <Reveal delay={0.1}>
              <div className="min-w-0 space-y-2">
                <div className="mb-3 flex items-center gap-2">
                  <Rss className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-semibold" style={{ color: "rgb(var(--t2))" }}>Son Yazılar</span>
                </div>
                <BlogSlider posts={sliderPosts} layout="row" />
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="space-y-3 border-t pt-5 md:pt-6"
                style={{ borderColor: "rgb(var(--surface2))" }}
              >
                <Link href="/blog"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-600 bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 sm:w-auto sm:justify-start">
                  <BookOpen className="h-4 w-4" />
                  Blog&apos;u oku
                </Link>

                <div
                  className="w-full rounded-2xl border border-indigo-500/25 bg-indigo-500/8 px-4 py-2.5"
                >
                  <div className="text-[10px] font-semibold" style={{ color: "rgb(var(--t-muted))" }}>4. Sınıf</div>
                  <div className="mt-0.5 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Computer Engineering</div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-2xl border border-violet-500/25 bg-violet-500/8 px-4 py-2.5">
                    <div className="text-[10px] font-semibold" style={{ color: "rgb(var(--t-muted))" }}>Antalya</div>
                    <div className="mt-0.5 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Intern 2026</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-2.5">
                    <div className="text-[10px] font-semibold" style={{ color: "rgb(var(--t-muted))" }}>GPA</div>
                    <div className="mt-0.5 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>2.85</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
          </div>
          </div>
        </section>
      </div>

      <Reveal delay={0.04}>
        <HomeDateClock />
      </Reveal>

      {/* ── PROJELER ── */}
      <section className="space-y-6">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <SectionTitle title="Projeler" subtitle="Güvenlik, backend ve NLP üzerine seçilmiş çalışmalar." />
            <Link href="/projects"
              className="hidden items-center gap-1.5 text-sm font-semibold transition sm:inline-flex"
              style={{ color: "rgb(var(--t3))" }}>
              Tümü <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjs.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}><ProjectCard project={p} /></Reveal>
          ))}
          {!featuredProjs.length && (
            <Reveal>
              <div className="rounded-2xl border p-6 text-sm"
                style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t3))" }}>
                Henüz proje yok.
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <TechBento />

      {/* ── SON YAZILAR ── */}
      <section className="space-y-6">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <SectionTitle title="Son Yazılar" subtitle="TECH, ACADEMIC ve GÜNLÜK kategorilerinden derli toplu notlar." />
            <Link href="/blog"
              className="hidden items-center gap-1.5 text-sm font-semibold transition sm:inline-flex"
              style={{ color: "rgb(var(--t3))" }}>
              Tümü <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}><PostCard post={p} /></Reveal>
          ))}
          {!latestPosts.length && (
            <Reveal>
              <div className="rounded-2xl border p-6 text-sm"
                style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t3))" }}>
                Henüz yazı yok.
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── İLGİNİ ÇEKEBİLİR (slider) ── */}
      {interestingPosts.length > 0 && (
        <section className="space-y-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle
                title="İlginizi çekebilir"
                subtitle="Görüntülenme ve güncelliğe göre öne çıkan yazılar — kaydırarak keşfet."
              />
              <div
                className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold sm:inline-flex"
                style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t3))" }}
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                Önerilen
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <BlogSlider posts={interestingPosts} />
          </Reveal>
        </section>
      )}
    </div>
  );
}
