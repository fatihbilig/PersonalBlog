"use client";

/* @uiw/react-md-editor stilleri olmadan araç çubuğu bozulur, yazı alanı görünmez / tıklanmaz hissi verir */
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthToken } from "@/lib/useAuthToken";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, ready } = useAuthToken();

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [ready, token, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-sm" style={{ color: "rgb(var(--t3))" }}>
          Oturum kontrol ediliyor…
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
