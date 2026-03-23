import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuraBackground from "@/components/AuraBackground";
import SocialDock from "@/components/SocialDock";
import CustomCursorDynamic from "@/components/CustomCursorDynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Fatih | Akademik & Teknik Portfolyo",
  description: "Bilgisayar Mühendisliği son sınıf. NLP, backend ve siber güvenlik odaklı portfolyo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      {/* Apply stored theme before paint */}
      <Script id="theme-init" strategy="beforeInteractive">{`
        (function(){
          try {
            var t = localStorage.getItem('theme');
            var root = document.documentElement;
            if(t==='light'){ root.classList.add('light'); root.classList.remove('dark'); }
            else { root.classList.add('dark'); root.classList.remove('light'); }
          }catch(e){}
        })();
      `}</Script>
      <body className={`${inter.variable} antialiased`}>
        <CustomCursorDynamic />
        <div className="min-h-dvh" style={{ background: "rgb(var(--bg))", color: "rgb(var(--t1))" }}>
          <AuraBackground />
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            {children}
          </main>
          <Footer />
          <SocialDock />
        </div>
      </body>
    </html>
  );
}
