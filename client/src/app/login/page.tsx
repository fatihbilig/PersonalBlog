"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api";
import { Lock, LogIn, User } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
      /* Tam sayfa geçiş: token kesin okunur, admin layout hidrasyon yarışı olmaz */
      window.location.assign(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
        style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
      >
        <div
          className="border-b px-8 py-6"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgb(var(--surface)) 100%)",
            borderColor: "rgb(var(--surface2))",
          }}
        >
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            Yönetim Paneli
          </div>
          <h1 className="mt-3 text-2xl font-black" style={{ color: "rgb(var(--t1))" }}>
            Giriş Yap
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgb(var(--t3))" }}>
            İçerik yönetimi için giriş yap.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-8 py-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>
              Kullanıcı adı
            </label>
            <div
              className="flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 transition focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20"
              style={{ background: "rgb(var(--surface2))", borderColor: "rgb(var(--border))" }}
            >
              <User className="h-4 w-4 shrink-0" style={{ color: "rgb(var(--t-muted))" }} />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
                style={{ color: "rgb(var(--t1))" }}
                placeholder="kullaniciadi"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgb(var(--t3))" }}>
              Şifre
            </label>
            <div
              className="flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 transition focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/20"
              style={{ background: "rgb(var(--surface2))", borderColor: "rgb(var(--border))" }}
            >
              <Lock className="h-4 w-4 shrink-0" style={{ color: "rgb(var(--t-muted))" }} />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
                style={{ color: "rgb(var(--t1))" }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70dvh] items-center justify-center text-sm" style={{ color: "rgb(var(--t3))" }}>
          Yükleniyor…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
