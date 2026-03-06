import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { siteConfig } from "@/lib/config";

const footerLinks = [
  { label: "Eventos", href: "/eventos" },
  { label: "Artistas", href: "/artistas" },
  { label: "Galería", href: "/galeria" },
  { label: "Info", href: "/info" },
  { label: "Entradas", href: "/eventos" },
];

const legalLinks = [
  { label: "Términos y condiciones", href: "/terminos" },
  { label: "Política de privacidad", href: "/privacidad" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      {/* Main footer content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '80px 64px' }}>
        <div style={{ display: 'flex', gap: '64px' }}>

          {/* Col 1: Logo + description */}
          <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <Link href="/">
              <div className="relative overflow-hidden" style={{ width: '240px', height: '96px' }}>
                <div className="absolute inset-0 w-full" style={{ height: '180%', top: '-40%' }}>
                  <Image
                    src="/logos/LOGO-BLANCO.png"
                    alt={siteConfig.name}
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </div>
            </Link>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255,255,255,0.4)', maxWidth: '420px' }}>
              {siteConfig.description}
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={26} />
              </a>
            </div>
          </div>

          {/* Col 2: Navegación */}
          <div style={{ flex: '1 1 25%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
              Navegación
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-white transition-colors duration-300"
                  style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3: Legal */}
          <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
              Legal
            </h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-white transition-colors duration-300"
                  style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Valparaiso, Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
