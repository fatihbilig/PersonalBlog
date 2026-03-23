import Link from "next/link";
import { Github, Instagram, Linkedin, Mail, Youtube } from "lucide-react";

const socials = [
  { label: "YouTube",   href: "https://www.youtube.com/@fatihbilig",                 Icon: Youtube,   cls: "text-red-400"   },
  { label: "Instagram", href: "https://www.instagram.com/thebilicii/",               Icon: Instagram, cls: "text-pink-400"  },
  { label: "LinkedIn",  href: "https://www.linkedin.com/in/fatih-bilici-a26a3b252/", Icon: Linkedin,  cls: "text-blue-400"  },
  { label: "GitHub",    href: "https://github.com/fatihbilig",                        Icon: Github,    cls: "text-slate-400" },
];

const pages = [
  { href: "/",         label: "Anasayfa"  },
  { href: "/projects", label: "Projeler"  },
  { href: "/blog",     label: "Blog"      },
  { href: "/about",    label: "Hakkımda"  },
  { href: "/contact",  label: "İletişim"  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "rgb(var(--surface2))" }}>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">

        {/* CTA card */}
        <div
          className="mb-12 overflow-hidden rounded-3xl border p-8"
          style={{
            borderColor: "rgba(99,102,241,0.25)",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgb(var(--surface)) 50%, rgba(139,92,246,0.08) 100%)",
          }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold" style={{ color: "rgb(var(--t1))" }}>
                <Mail className="h-5 w-5 text-indigo-400" />
                Bir projen mi var?
              </div>
              <p className="mt-2 text-sm" style={{ color: "rgb(var(--t3))" }}>
                Akademik işbirliği, proje fikri veya sadece merhaba demek için ulaş.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="mailto:fatihbilig@gmail.com"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
              >
                <Mail className="h-4 w-4" />
                Mail Gönder
              </Link>
              <Link
                href="https://www.linkedin.com/in/fatih-bilici-a26a3b252/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:brightness-110"
                style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t1))" }}
              >
                <Linkedin className="h-4 w-4 text-blue-400" />
                LinkedIn
              </Link>
            </div>
          </div>
        </div>

        {/* Links row */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="text-base font-bold" style={{ color: "rgb(var(--t1))" }}>Fatih</div>
            <p className="max-w-xs text-sm leading-6" style={{ color: "rgb(var(--t3))" }}>
              Bilgisayar Mühendisliği son sınıf. Kişisel blog, projeler ve akademik notlar.
            </p>
            <div className="flex gap-2 pt-1">
              {socials.map(({ href, label, Icon, cls }) => (
                <Link
                  key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition hover:brightness-125"
                  style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))" }}
                >
                  <Icon className={`h-4 w-4 ${cls}`} />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-12">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--t-muted))" }}>
                Sayfalar
              </div>
              {pages.map(l => (
                <Link key={l.href} href={l.href} className="footer-nav-link block text-sm transition">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--t-muted))" }}>
                Kategoriler
              </div>
              {["TECH", "ACADEMIC", "GÜNLÜK"].map(c => (
                <Link key={c} href="/blog" className="footer-nav-link block text-sm transition">
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col gap-2 border-t pt-8 text-xs sm:flex-row sm:items-center sm:justify-end"
          style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t-muted))" }}
        >
          <span>© {new Date().getFullYear()} Fatih. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}
