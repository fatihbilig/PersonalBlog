"use client";

import { useState } from "react";
import Link from "next/link";
import { Instagram, Linkedin, Mail, MessageSquare, Youtube } from "lucide-react";
import Reveal from "@/components/Reveal";
import { submitContactForm } from "@/lib/api";

const CONTACT_EMAIL = "fatihbilig@gmail.com";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fatih-bilici-a26a3b252/", Icon: Linkedin, cls: "text-blue-400", border: "border-blue-500/30 bg-blue-500/8" },
  { label: "Instagram", href: "https://www.instagram.com/thebilicii/", Icon: Instagram, cls: "text-pink-400", border: "border-pink-500/30 bg-pink-500/8" },
  { label: "YouTube", href: "https://www.youtube.com/@fatihbilig", Icon: Youtube, cls: "text-red-400", border: "border-red-500/30 bg-red-500/8" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await submitContactForm({ name, email, subject, message });
      setStatus({
        type: "success",
        text: "Mesajın başarıyla gönderildi. En kısa sürede dönüş yapacağım.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Mesaj gönderilirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inp =
    "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 placeholder:text-slate-500";
  const inpStyle = {
    background: "rgb(var(--surface))",
    borderColor: "rgb(var(--surface2))",
    color: "rgb(var(--t1))",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <Reveal>
        <header className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            İletişim
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "rgb(var(--t1))" }}>
            Merhaba 👋
          </h1>
          <p className="max-w-lg text-sm leading-7" style={{ color: "rgb(var(--t3))" }}>
            Akademik işbirliği, proje fikri veya sadece sohbet etmek için formu doldur.
            Mesajın doğrudan <strong style={{ color: "rgb(var(--t2))" }}>{CONTACT_EMAIL}</strong> adresime iletilir.
          </p>
        </header>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Reveal delay={0.06}>
            <div className="rounded-3xl border p-7" style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}>
              <div className="mb-5 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold" style={{ color: "rgb(var(--t1))" }}>Mesaj Gönder</h2>
              </div>

              {status ? (
                <div
                  className={`rounded-2xl border p-4 text-sm ${
                    status.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  }`}
                >
                  {status.text}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>Ad Soyad</label>
                    <input value={name} onChange={e => setName(e.target.value)} className={inp} style={inpStyle} placeholder="Adın Soyadın" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>E-posta</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} style={inpStyle} placeholder="mail@ornek.com" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>Konu</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} className={inp} style={inpStyle} placeholder="Mesajın konusu..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>Mesaj <span className="text-rose-400">*</span></label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} className={`${inp} min-h-36 resize-none`} style={inpStyle} placeholder="Merhaba Fatih, ..." required />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Mail className="h-4 w-4" />
                  {isSubmitting ? "Gönderiliyor..." : "Mesajı Gönder"}
                </button>
                <p className="text-center text-xs" style={{ color: "rgb(var(--t3))" }}>
                  Bu form artık mail istemcisini açmaz; mesaj doğrudan {CONTACT_EMAIL} adresine gönderilir.
                </p>
              </form>
            </div>
          </Reveal>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Reveal delay={0.08}>
            <div className="rounded-3xl border p-6" style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}>
              <div className="mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-400" />
                <h2 className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Doğrudan E-posta</h2>
              </div>
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                className="block text-sm font-semibold text-indigo-400 transition hover:text-indigo-300 underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </Link>
              <p className="mt-2 text-xs leading-5" style={{ color: "rgb(var(--t3))" }}>
                Akademik işbirliği, proje soruları veya iş teklifleri için istersen doğrudan da mail atabilirsin.
                Genellikle 24-48 saat içinde yanıt veririm.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-3 rounded-3xl border p-6" style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}>
              <h2 className="mb-1 text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>Sosyal Medya</h2>
              {socials.map(({ href, label, Icon, cls, border }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-2xl border ${border} px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lg`}
                >
                  <Icon className={`h-5 w-5 ${cls}`} />
                  <span style={{ color: "rgb(var(--t2))" }}>{label}</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
