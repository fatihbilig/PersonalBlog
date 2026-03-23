import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Birden fazla package-lock yüzünden Next bazen C:\Users\...\ üst klasörü kök sanıyor */
  turbopack: {
    root: path.join(__dirname),
  },
  /* Dev derlemesini ve bazı sayfalarda maliyeti azaltır; gerekirse true yap */
  reactCompiler: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
