"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Facebook,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";

type Props = {
  slug: string;
  title: string;
};

export default function SharePost({ slug, title }: Props) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareOk, setShareOk] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window === "undefined") return;
      setUrl(`${window.location.origin}/blog/${encodeURIComponent(slug)}`);
      setCanNativeShare(typeof navigator.share === "function");
    });
  }, [slug]);

  const encodedUrl = useMemo(() => encodeURIComponent(url || ""), [url]);
  const encodedTitle = useMemo(() => encodeURIComponent(title), [title]);
  const line = useMemo(() => encodeURIComponent(`${title}\n${url}`), [title, url]);

  const open = useCallback((href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=520");
  }, []);

  const copyLink = useCallback(async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareOk("Kopyalanamadı — bağlantıyı elle seçin.");
      window.setTimeout(() => setShareOk(null), 3000);
    }
  }, [url]);

  const nativeShare = useCallback(async () => {
    if (!url) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        setShareOk("Paylaşıldı");
        window.setTimeout(() => setShareOk(null), 2000);
      } catch {
        /* kullanıcı iptal */
      }
    } else {
      void copyLink();
    }
  }, [copyLink, title, url]);

  const btn =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5"
      style={{ background: "rgb(var(--surface))", borderColor: "rgb(var(--surface2))" }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Share2 className="h-4 w-4 text-indigo-400" aria-hidden />
        <h3 className="text-sm font-bold" style={{ color: "rgb(var(--t1))" }}>
          Paylaş
        </h3>
        {shareOk && (
          <span className="text-xs font-medium text-emerald-400">{shareOk}</span>
        )}
      </div>
      <p className="mb-4 text-xs leading-relaxed" style={{ color: "rgb(var(--t3))" }}>
        Bu yazıyı sosyal medyada veya mesajla paylaş; bağlantı panoya da kopyalanabilir.
      </p>
      <div className="flex flex-wrap gap-2">
        {canNativeShare && (
          <button
            type="button"
            onClick={() => void nativeShare()}
            className={`${btn} bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent px-4 w-auto gap-2 text-xs font-semibold`}
            disabled={!url}
          >
            <Share2 className="h-4 w-4" />
            Sistem paylaşımı
          </button>
        )}
        <button
          type="button"
          onClick={() => void copyLink()}
          className={btn}
          style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
          title="Bağlantıyı kopyala"
          disabled={!url}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() =>
            open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)
          }
          className={btn}
          style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
          title="X (Twitter)"
          disabled={!url}
        >
          <span className="text-[11px] font-black">𝕏</span>
        </button>
        <button
          type="button"
          onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
          className={btn}
          style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
          title="LinkedIn"
          disabled={!url}
        >
          <Linkedin className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)
          }
          className={btn}
          style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
          title="Facebook"
          disabled={!url}
        >
          <Facebook className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => open(`https://wa.me/?text=${line}`)}
          className={btn}
          style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
          title="WhatsApp"
          disabled={!url}
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`)
          }
          className={btn}
          style={{ borderColor: "rgb(var(--surface2))", color: "rgb(var(--t2))" }}
          title="Telegram"
          disabled={!url}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {url && (
        <p
          className="mt-3 break-all rounded-lg border px-3 py-2 font-mono text-[11px]"
          style={{
            borderColor: "rgb(var(--surface2))",
            background: "rgb(var(--surface2))",
            color: "rgb(var(--t3))",
          }}
        >
          {url}
        </p>
      )}
    </div>
  );
}
