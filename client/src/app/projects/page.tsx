import { getProjectsCached } from "@/lib/server-data";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

export const metadata = { title: "Projeler | Fatih" };

export default async function ProjectsPage() {
  const projects = await getProjectsCached();
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
        <Reveal delay={0.10}>
          <p className="max-w-xl text-sm leading-7" style={{ color: "rgb(var(--t3))" }}>
           Güvenlik, Backend ve Yapay Zeka (NLP) ekseninde şekillenen mühendislik çalışmaları. Her proje; sadece bir kod yığını değil; net bir problem tanımı, stratejik bir çözüm yaklaşımı ve somut çıkarımlardan oluşan bütünsel bir süreçtir.
          </p>
        </Reveal>
      </header>

      <Reveal delay={0.12}>
        <SectionTitle title="Tüm Projeler" />
      </Reveal>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.length ? projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <ProjectCard project={p} />
          </Reveal>
        )) : (
          <Reveal>
            <div className="rounded-2xl border p-6 text-sm"
              style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t3))" }}>
              Henüz proje eklenmemiş.
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}
