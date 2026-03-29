import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogListTab } from "@/lib/blogQuery";
import { blogListHref } from "@/lib/blogQuery";
import { visiblePageNumbers } from "@/lib/pagination";

type Props = {
  page: number;
  totalPages: number;
  kategori: BlogListTab;
  ara: string;
};

export default function BlogPagination({ page, totalPages, kategori, ara }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const base = { kategori, ara };
  const numbers = visiblePageNumbers(page, totalPages);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
      aria-label="Sayfa navigasyonu"
    >
      <Link
        href={blogListHref({ ...base, sayfa: prev ?? 1 })}
        aria-disabled={!prev}
        className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          prev
            ? "hover:border-indigo-500/40 hover:bg-indigo-500/10"
            : "pointer-events-none opacity-40"
        }`}
        style={{
          borderColor: "rgb(var(--surface2))",
          color: "rgb(var(--t2))",
        }}
      >
        <ChevronLeft className="h-4 w-4" />
        Önceki
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
        {numbers.map(n => {
          const active = n === page;
          return (
            <Link
              key={n}
              href={blogListHref({ ...base, sayfa: n > 1 ? n : undefined })}
              className={`flex min-w-9 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
                  : "hover:bg-slate-700/30"
              }`}
              style={
                active
                  ? undefined
                  : { color: "rgb(var(--t2))", background: "rgb(var(--surface))" }
              }
              aria-current={active ? "page" : undefined}
            >
              {n}
            </Link>
          );
        })}
      </div>

      <Link
        href={blogListHref({ ...base, sayfa: next ?? page })}
        aria-disabled={!next}
        className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          next
            ? "hover:border-indigo-500/40 hover:bg-indigo-500/10"
            : "pointer-events-none opacity-40"
        }`}
        style={{
          borderColor: "rgb(var(--surface2))",
          color: "rgb(var(--t2))",
        }}
      >
        Sonraki
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
