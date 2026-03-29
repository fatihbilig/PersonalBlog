/** Anasayfa foto slider — `public/images/hero/slide-01` … `slide-09` */
export type HeroSlide = {
  src: string;
  alt: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  { src: "/images/hero/slide-01.jpeg", alt: "Plaka koleksiyonu ve taş duvar" },
  { src: "/images/hero/slide-02.png", alt: "Rafting" },
  { src: "/images/hero/slide-03.png", alt: "Cam tavanlı avlu" },
  { src: "/images/hero/slide-04.png", alt: "Gece şehir" },
  { src: "/images/hero/slide-05.png", alt: "At binme" },
  { src: "/images/hero/slide-06.jpeg", alt: "Kale önünde" },
  { src: "/images/hero/slide-07.jpeg", alt: "Gece teras" },
  { src: "/images/hero/slide-08.jpeg", alt: "Balkon manzarası" },
  { src: "/images/hero/slide-09.jpeg", alt: "Kıyı şehir manzarası" },
];
