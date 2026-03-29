import type { Metadata } from "next";
import { getProjectsPagedForRsc } from "@/lib/api";
import { PROJECT_PAGE_SIZE, parseProjectSearchParams } from "@/lib/projectQuery";
import ProjectsListing from "@/components/ProjectsListing";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const { sayfa } = parseProjectSearchParams(sp);
  if (sayfa > 1) return { title: `Projeler (sayfa ${sayfa}) | Fatih` };
  return { title: "Projeler | Fatih" };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { sayfa, ara } = parseProjectSearchParams(sp);

  const { projects, total, page, totalPages } = await getProjectsPagedForRsc({
    page: sayfa,
    pageSize: PROJECT_PAGE_SIZE,
    search: ara || undefined,
  });

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <Reveal>
          <div className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
            Çalışmalar
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "rgb(var(--t1))" }}>
            Projeler
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-xl text-sm leading-7" style={{ color: "rgb(var(--t3))" }}>
            Güvenlik, Backend ve Yapay Zeka (NLP) ekseninde şekillenen mühendislik çalışmaları. Her proje; sadece bir kod yığını değil; net bir problem tanımı, stratejik bir çözüm yaklaşımı ve somut çıkarımlardan oluşan bütünsel bir süreçtir.
          </p>
        </Reveal>
      </header>

      <Reveal delay={0.12}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle title="Tüm Projeler" subtitle="Ara veya sayfa seç." />
          <span className="text-sm" style={{ color: "rgb(var(--t-muted))" }}>
            {total} proje{ara ? " (filtreli)" : ""}
          </span>
        </div>
      </Reveal>

      <ProjectsListing
        projects={projects}
        total={total}
        page={page}
        totalPages={totalPages}
        ara={ara}
      />
    </div>
  );
}
