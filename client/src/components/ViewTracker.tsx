"use client";

import { useEffect } from "react";
import { registerView } from "@/lib/api";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    void registerView(slug);
  }, [slug]);

  return null;
}
