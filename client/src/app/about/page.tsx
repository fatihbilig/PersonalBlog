import Reveal from "@/components/Reveal";
import AboutPortrait from "@/components/AboutPortrait";
import { BookOpen, Briefcase, Download, GraduationCap, Mail, MapPin, Phone, Star, Target } from "lucide-react";

export const metadata = { title: "Hakkımda | Fatih" };

const timeline = [
  { time: "2022–2026", title: "Afyon Kocatepe Üniversitesi", subtitle: "Bilgisayar Mühendisliği", desc: "Temel CS dersleri, algoritma ve proje tabanlı öğrenme.", icon: GraduationCap, color: "#6366f1" },
  { time: "2024–2025", title: "Talya Bilişim", subtitle: "Yaz Stajı", desc: "Nextjs tabanlı Otel rezervasyon sitesi / Frontend", icon: Briefcase, color: "#8b5cf6" },
  { time: "2025–2026", title: "Talya Bilişim — Staj", subtitle: "İşletmede Mesleki Eğitim", desc: "API tasarımı, hata yönetimi, loglama ve test yaklaşımı.", icon: Briefcase, color: "#8b5cf6" },
  { time: "Hedef", title: "Akademik Kariyer", subtitle: "Yüksek Lisans & Araştırma", desc: "Yüksek Mühendislik", icon: Target, color: "#34d399" },
];

const skills = [
  { cat: "Backend & Database", items: ["Node.js", "TypeScript", "Express", "Prisma", "MySQL", "Ms SQL", "ASP.NET MVC ", "Flask","Entity Framework","C#"] },
  { cat: "Frontend", items: ["HTML", "CSS", "Tailwind CSS", "Bootstrap", "JavaScript"] },
  { cat: "AI / NLP", items: ["Python", "PyTorch", "NLTK", "Transformers", "scikit-learn", "pandas", "numpy","RAG","Veri Madenciliği","Derin Öğrenme"] },
  { cat: "DevOps", items: ["Docker", "Git", "GitHub Actions", "Postman"] },
 { cat: "Game Development", items: ["Unity"] },
  { cat: "Görüntü İşleme", items: ["MatLab","Kenar Algılama Algoritmaları","Görüntü Segmentasyonu","Görüntü Filterleme"] },
];

const langs = [
  { lang: "Türkçe", level: "Anadil", pct: 100, color: "#6366f1" },
  { lang: "İngilizce", level: "B1", pct: 72, color: "#8b5cf6" },
];

const interests = [
  { emoji: "🔐", title: "Siber Güvenlik", desc: "Özellikle phishing tespiti ve ESP32 tabanlı Wi-Fi sniffer projeleriyle ağ güvenliği anomali tespiti üzerine çalışmalar." },
  { emoji: "🧠", title: "NLP / AI", desc: "Modern NLP kütüphanelerine (Hugging Face, PyTorch) hakimiyet. BERT ve Word2Vec modelleriyle Türkçe metin işleme, embedding optimizasyonu ve ince ayar (fine-tuning) süreçleri." },
  { emoji: "⚙️", title: "Backend", desc: "Gözlemlenebilir, sağlam ve bakımı kolay API'lar ve Backend Tasarım Mimarileri" },
  { emoji: "📚", title: "Akademik Yazım", desc: "Bilimsel araştırma metodolojisi, sistematik bulgu paylaşımı ve düşük maliyetli saldırı tespit sistemleri üzerine akademik yayın hazırlığı." },
];

const surface = { background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* CV header */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border p-8" style={surface}>
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10 lg:flex-1">
              <AboutPortrait />
              <div className="w-full min-w-0 space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  Özgeçmiş
                </div>
                <h1 className="text-4xl font-black" style={{ color: "rgb(var(--t1))" }}>Fatih Bilici</h1>
                <p className="text-base font-semibold" style={{ color: "rgb(var(--t3))" }}>
                  Bilgisayar Mühendisi · Backend Developer 
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm sm:justify-start" style={{ color: "rgb(var(--t3))" }}>
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 shrink-0 text-indigo-400" />fatihbilig@gmail.com</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 shrink-0 text-indigo-400" />+90 533 161 6523</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0 text-indigo-400" />Türkiye</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 shrink-0 text-indigo-400" />GPA: 2.85 / 4.0</span>
                </div>
              </div>
            </div>
            <a
              href="/Fatih-Bilici-CV.pdf"
              download="Fatih-Bilici-CV.pdf"
              className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 whitespace-nowrap lg:self-start"
            >
              <Download className="h-4 w-4" />CV İndir
            </a>
          </div>
        </div>
      </Reveal>

      {/* Grid layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — narrow column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Skills */}
          <Reveal delay={0.05}>
            <div className="rounded-3xl border p-5 space-y-4" style={surface}>
              <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>
                <Star className="h-4 w-4 text-indigo-400" />Yetkinlikler
              </h2>
              {skills.map(s => (
                <div key={s.cat}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--t3))" }}>
                    {s.cat}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.items.map(item => (
                      <span key={item} className="rounded-full border px-2.5 py-0.5 text-xs"
                        style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Languages */}
          <Reveal delay={0.08}>
            <div className="rounded-3xl border p-5 space-y-4" style={surface}>
              <h2 className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Diller</h2>
              {langs.map(l => (
                <div key={l.lang} className="space-y-1">
                  <div className="flex justify-between text-xs" style={{ color: "rgb(var(--t2))" }}>
                    <span className="font-semibold">{l.lang}</span>
                    <span style={{ color: l.color }}>{l.level}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgb(var(--surface2))" }}>
                    <div className="h-full rounded-full" style={{ width: `${l.pct}%`, background: l.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Interests */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border p-5 space-y-3" style={surface}>
              <h2 className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>İlgi Alanları</h2>
              {interests.map(x => (
                <div key={x.title} className="flex gap-3">
                  <span className="text-xl">{x.emoji}</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "rgb(var(--t1))" }}>{x.title}</div>
                    <div className="text-[11px]" style={{ color: "rgb(var(--t3))" }}>{x.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* RIGHT — wide column */}
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Reveal delay={0.04}>
            <div className="rounded-3xl border p-6" style={surface}>
              <h2 className="mb-4 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Hakkımda</h2>
              <div className="space-y-3 text-sm leading-7" style={{ color: "rgb(var(--t2))" }}>

                <p>
Merhaba, ben Fatih Bilici. 8 Ekim 2004 tarihinde İstanbul’da doğdum. İlkokul üçüncü sınıfta ailemle birlikte Antalya’ya taşındım. İlkokul ve ortaokul eğitimimi Hüseyin Ak İlkokulu ve Hüseyin Ak Ortaokulu’nda, lise eğitimimi ise Atatürk Anadolu Lisesi’nde tamamladım.
</p>

<p>
Lisans eğitimimi Afyon Kocatepe Üniversitesi Bilgisayar Mühendisliği bölümünde tamamladım. Üniversite sürecimde özellikle backend geliştirme, veri odaklı düşünme ve sistemlerin arka plan mimarisini anlama konularına odaklandım. Yazılım geliştirmede yalnızca çalışan bir sistem üretmenin yeterli olmadığını düşünüyorum; benim için önemli olan sistemlerin okunabilir, sürdürülebilir ve ölçeklenebilir bir şekilde tasarlanmasıdır.
</p>

<p>
Geliştirme sürecinde genellikle küçük bir prototiple başlayıp sistemi adım adım geliştirmeyi tercih ederim. Bu süreçte test, loglama, hata yönetimi ve izlenebilirlik gibi üretim ortamı pratiklerini sisteme ekleyerek daha güvenilir yazılımlar oluşturmayı hedeflerim. Antalya’da gerçekleştirdiğim staj deneyimi sırasında API tasarımı, veri doğrulama ve sistem mimarisi konularında alınan teknik kararların yazılım kalitesi üzerindeki etkilerini yakından gözlemleme fırsatı buldum.
</p>

<p>
Backend geliştirme alanına ek olarak donanım ve siber güvenlik kesişiminde de projeler geliştirdim. ESP32 mikrodenetleyicisi kullanarak geliştirdiğim “Düşük Maliyetli Kablosuz Saldırı Tespiti” projesi üzerine akademik bir çalışma hazırladım ve bu çalışma bir konferansta sözlü sunum olarak kabul edildi. Bu proje kapsamında kablosuz ağ trafiği analizi, anomali tespiti ve ağ güvenliği konularında pratik deneyim kazandım.
</p>

<p>
Ayrıca yapay zeka alanına da ilgi duyuyorum. Üniversitede aldığım Derin Öğrenme ve Veri Madenciliği dersleri kapsamında veri odaklı bazı projeler geliştirdim. Bu süreçte özellikle metin verileri üzerinde çalışarak Türkçe şarkı sözleri üzerinden duygu analizi ve derin öğrenme tabanlı phishing (oltalama) tespiti gibi uygulamalar geliştirdim. Bu çalışmalar sayesinde makine öğrenmesi modellerinin veri analizi ve güvenlik alanlarında nasıl kullanılabileceğini deneyimleme fırsatı elde ettim.
</p>

<p>
Akademik hayatım boyunca Bilgisayar Mühendisliği ve Yapay Zeka kulüplerinde aktif görevler alarak topluluk çalışmalarına katkı sağladım. Özellikle GDG (Google Developer Groups) bünyesinde yürüttüğüm yöneticilik görevleri ve DevFest gibi geniş katılımlı organizasyonlardaki operasyonel sorumluluklarım sayesinde ekip çalışması, organizasyon yönetimi ve liderlik becerilerimi geliştirdim.
</p>

<p>
Hedefim, edindiğim bu teknik ve sosyal birikimi profesyonel bir çalışma ortamında katma değere dönüştürerek sürekli gelişen bir mühendislik kariyeri inşa etmektir.
</p>
              </div>
            </div>
          </Reveal>

          {/* Timeline */}
          <Reveal delay={0.07}>
            <div className="rounded-3xl border p-6" style={surface}>
              <h2 className="mb-6 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Deneyim & Eğitim</h2>
              <div className="relative space-y-0">
                <div className="absolute left-[18px] top-0 bottom-0 w-px" style={{ background: "rgb(var(--surface2))" }} />
                {timeline.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className={`relative flex gap-5 ${i < timeline.length - 1 ? "pb-7" : ""}`}>
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-4"
                        style={{ background: `${item.color}20`, color: item.color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1 space-y-0.5">
                        <div className="text-xs font-semibold" style={{ color: item.color }}>{item.time}</div>
                        <div className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>{item.title}</div>
                        <div className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>{item.subtitle}</div>
                        <div className="text-xs leading-5" style={{ color: "rgb(var(--t3))" }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Projects highlight */}
          <Reveal delay={0.09}>
            <div className="rounded-3xl border p-6" style={surface}>
              <h2 className="mb-4 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Öne Çıkan Projeler</h2>
              {[
                {
                  title: "Düşük Maliyetli Kablosuz Saldırı Tespit Sistemi (Akademik)",
                  tech: ["C++", "ESP32", "Network Security", "Anomaly Detection"],
                  desc: "ESP32 mikrodenetleyici mimarisi üzerinde, Wi-Fi ağlarındaki şüpheli paket trafiğini ve anomali durumlarını gerçek zamanlı analiz eden, düşük maliyetli ve yüksek verimli bir siber güvenlik çözümü. Akademik yayın hazırlığı kapsamında geliştirilen bu sistem; ağ protokolleri, paket koklama (sniffing) ve saldırı imza tespiti süreçlerini kapsar."
                },
                {
                  title: "Türkçe Şarkı Sözlerinde Duygu Sınıflandırması",
                  tech: ["Python", "PyTorch", "BERT (dbmdz)", "Hugging Face"],
                  desc: "26.431 şarkı sözü içeren veri seti üzerinde, transfer learning (BERT) ile %82.25 doğruluk oranına ulaşan, 5 farklı duygu kategorisinde anlamsal analiz yapan NLP projesi."
                },
                { 
  title: "Ölçeklenebilir CSV Job Processing API", 
  tech: ["TypeScript", "Node.js", "Prisma", "Redis"], 
  desc: "Büyük ölçekli veri setlerini (CSV) sistem kaynaklarını tüketmeden asenkron olarak işleyen, hata toleranslı ve izlenebilirlik odaklı backend çözümü. Kuyruk yönetimi (Queue Management) ve worker yapıları kullanılarak 'production-ready' standartlarda geliştirilmiştir." 
},
               { 
  title: "Yüksek Performanslı URL Shortener", 
  tech: ["TypeScript", "Next.js", "Redis", "PostgreSQL"], 
  desc: "Yüksek trafikli yönlendirme isteklerini milisaniyeler seviyesinde karşılayan, Redis tabanlı önbellekleme (caching) mekanizmasıyla optimize edilmiş ve detaylı tıklama analitiği sunan mikroservis mimarisi." 
}
              ].map(p => (
                <div key={p.title} className="mb-4 last:mb-0 rounded-2xl border p-4"
                  style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))" }}>
                  <div className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>{p.title}</div>
                  <div className="mt-1 text-xs leading-5" style={{ color: "rgb(var(--t3))" }}>{p.desc}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.tech.map(t => (
                      <span key={t} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] text-indigo-300">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
