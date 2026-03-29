import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { projectListHref } from "@/lib/projectQuery";
import { visiblePageNumbers } from "@/lib/pagination";

type Props = {
  page: number;
  totalPages: number;
  ara: string;
};

export default function ProjectPagination({ page, totalPages, ara }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const base = { ara };
  const numbers = visiblePageNumbers(page, totalPages);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
      aria-label="Sayfa navigasyonu"
    >
      <Link
        href={projectListHref({ ...base, sayfa: prev ?? 1 })}
        aria-disabled={!prev}
        className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          prev
            ? "hover:border-violet-500/40 hover:bg-violet-500/10"
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
              href={projectListHref({ ...base, sayfa: n > 1 ? n : undefined })}
              className={`flex min-w-9 items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
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
        href={projectListHref({ ...base, sayfa: next ?? page })}
        aria-disabled={!next}
        className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          next
            ? "hover:border-violet-500/40 hover:bg-violet-500/10"
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
