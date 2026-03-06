/* ── Site-wide design tokens ── */

export const siteConfig = {
  name: "delotrolado",
  domain: "delotrolado.club",
  description:
    "Portal oficial del colectivo delotrolado — eventos, artistas, entradas y galería.",
  url: "https://delotrolado.club",
  ogImage: "/logos/LOGO-BLANCO.png",
  links: {
    instagram: "https://www.instagram.com/__delotrolado/",
  },
} as const;

export const navLinks = [
  { label: "Eventos", href: "/eventos" },
  { label: "Artistas", href: "/artistas" },
  { label: "Galería", href: "/galeria" },
  { label: "Info", href: "/info" },
] as const;
