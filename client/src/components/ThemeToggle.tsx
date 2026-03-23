"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

function apply(t: Theme) {
  const root = document.documentElement;
  if (t === "light") { root.classList.add("light"); root.classList.remove("dark"); }
  else               { root.classList.add("dark");  root.classList.remove("light"); }
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "light") return "light";
  if (stored === "dark")  return "dark";
  return "dark"; // default dark
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    queueMicrotask(() => {
      const t = getStoredTheme();
      setTheme(t);
      apply(t);
    });
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Açık moda geç" : "Koyu moda geç"}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:brightness-110"
      style={{
        borderColor: "rgb(var(--surface2))",
        background: "rgb(var(--surface2))",
        color: "rgb(var(--t2))",
      }}
    >
      {theme === "dark"
        ? <Sun  className="h-4 w-4" />
        : <Moon className="h-4 w-4" />
      }
    </button>
  );
}
