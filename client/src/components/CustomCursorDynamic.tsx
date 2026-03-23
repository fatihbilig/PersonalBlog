"use client";

import dynamic from "next/dynamic";

/** Server layout içinde `dynamic(..., { ssr: false })` kullanılamaz; sarmalayıcı Client Component. */
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});

export default function CustomCursorDynamic() {
  return <CustomCursor />;
}
