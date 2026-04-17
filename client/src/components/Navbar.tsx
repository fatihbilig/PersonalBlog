"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  ChevronRight, LayoutDashboard, LogIn, LogOut, Menu, Plus, X,
} from "lucide-react";
import { clearToken, getToken, onAuthTokenChange } from "@/lib/api";
import GlobalSearch from "@/components/GlobalSearch";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/", label: "Anasayfa" },
  { href: "/projects", label: "Projeler" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "Hakkımda" },
  { href: "/contact", label: "İletişim" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const underlineRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    queueMicrotask(() => setAuthed(!!getToken()));
  }, [pathname]);

  useEffect(() => {
    return onAuthTokenChange(() => setAuthed(!!getToken()));
  }, []);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 12);
    s();
    window.addEventListener("scroll", s, { passive: true });
    return () => window.removeEventListener("scroll", s);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    const under = underlineRef.current;
    if (!nav || !under) return;
    const active = nav.querySelector<HTMLElement>("[data-active='true']");
    if (active) {
      const rect = active.getBoundingClientRect();
      const navR = nav.getBoundingClientRect();
      under.style.left = `${rect.left - navR.left}px`;
      under.style.width = `${rect.width}px`;
      under.style.opacity = "1";
    } else {
      under.style.opacity = "0";
    }
  }, [pathname]);

  const activeHref = useMemo(() => {
    if (!pathname) return "/";
    for (const item of [...navItems].reverse()) {
      if (pathname.startsWith(item.href) && item.href !== "/") return item.href;
    }
    return "/";
  }, [pathname]);

  function onLogout() {
    clearToken();
    setAuthed(false);
    router.replace("/");
  }

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full border-b transition-all duration-300 backdrop-blur-xl",
        scrolled ? "shadow-2xl shadow-black/15" : "shadow-none",
      )}
      style={{
        background: scrolled
          ? "color-mix(in srgb, rgb(var(--bg)) 94%, transparent)"
          : "color-mix(in srgb, rgb(var(--bg)) 76%, transparent)",
        borderBottomColor: scrolled
          ? "rgb(var(--surface2) / 0.9)"
          : "rgb(var(--surface2) / 0.35)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" prefetch={false} onClick={() => setOpen(false)} className="group shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative hidden h-9 w-9 sm:block">
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/60 via-indigo-500/60 to-orange-400/60 blur-[10px] transition duration-300 group-hover:scale-110" />
              <span
                className="absolute inset-0 rounded-2xl border"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(16,185,129,0.14) 48%, rgba(249,115,22,0.14) 100%)",
                  borderColor: "rgb(var(--surface2))",
                }}
              />
              <span className="absolute left-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="absolute right-[7px] top-[8px] h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span className="absolute bottom-[8px] left-[9px] h-1.5 w-4 rounded-full bg-indigo-400" />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="bg-gradient-to-r from-emerald-400 via-indigo-400 to-orange-400 bg-clip-text text-[1.04rem] font-black uppercase tracking-[0.18em] text-transparent transition duration-300 group-hover:tracking-[0.22em] group-hover:brightness-110"
              >
                Fatih Bilici
              </span>
              <span
                className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.32em] sm:block"
                style={{ color: "rgb(var(--t3))" }}
              >
                Blog · Projeler · Notlar
              </span>
            </div>
          </div>
        </Link>

        <nav
          ref={navRef}
          className="relative hidden items-center gap-0.5 rounded-2xl border p-1.5 sm:flex"
          style={{
            background: "color-mix(in srgb, rgb(var(--surface)) 78%, transparent)",
            borderColor: "rgb(var(--border) / 0.55)",
          }}
        >
          <div
            ref={underlineRef}
            className="pointer-events-none absolute bottom-1.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ opacity: 0 }}
          />
          {navItems.map(item => {
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                data-active={active}
                className={clsx(
                  "relative z-10 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 shadow-sm"
                    : "hover:bg-slate-200/70 dark:hover:bg-white/10",
                )}
                style={{ color: active ? "rgb(var(--t1))" : "rgb(var(--t3))" }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <GlobalSearch />
          <ThemeToggle />

          <div className="hidden items-center gap-2 sm:flex">
            {authed ? (
              <>
                <Link
                  href="/admin"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
                <Link
                  href="/admin/add-post"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                >
                  <Plus className="h-4 w-4" />
                  Yazı
                </Link>
                <Link
                  href="/admin/add-project"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  <Plus className="h-4 w-4" />
                  Proje
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition hover:bg-slate-700"
                  style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t2))" }}
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış
                </button>
              </>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
              >
                <LogIn className="h-4 w-4" />
                Giriş
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border p-2 transition hover:bg-slate-200/80 dark:hover:bg-slate-700 sm:hidden"
            style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface))", color: "rgb(var(--t2))" }}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t sm:hidden" style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--bg))" }}>
          <div className="mx-auto max-w-6xl space-y-1.5 px-4 py-4">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  activeHref === item.href
                    ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/90",
                )}
                style={{
                  borderColor: activeHref === item.href ? undefined : "rgb(var(--surface2))",
                  background: activeHref === item.href ? undefined : "rgb(var(--surface))",
                  color: activeHref === item.href ? undefined : "rgb(var(--t2))",
                }}
              >
                {item.label}
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
            <div className="space-y-1.5 pt-2">
              {authed ? (
                <>
                  <Link
                    href="/admin"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-bold text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Link>
                  <Link
                    href="/admin/add-post"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold"
                    style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t1))" }}
                  >
                    <Plus className="h-4 w-4" />
                    Yeni Yazı
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold"
                    style={{ borderColor: "rgb(var(--surface2))", background: "rgb(var(--surface2))", color: "rgb(var(--t1))" }}
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-bold text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
