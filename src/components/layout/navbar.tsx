"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const allNavLinks = [
  { label: "Eventos", href: "/eventos" },
  { label: "Artistas", href: "/artistas" },
  { label: "Galería", href: "/galeria" },
  { label: "Info", href: "/info" },
  { label: "Entradas", href: "/eventos" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#1a1a1a] backdrop-blur-xl border-b border-white/10"
          : "bg-[#1a1a1a] border-b border-white/5"
      )}
    >
      {/* Full-width flex: logo is first cell, links fill the rest equally */}
      <nav className="flex h-20 lg:h-24 w-full items-stretch">
        {/* Logo — same flex-1 as other links */}
        <Link href="/" className="relative z-50 flex items-center justify-center flex-1">
          <div className="relative w-[120px] md:w-[140px] lg:w-[160px] h-[48px] md:h-[56px] lg:h-[64px] overflow-hidden">
            <div className="absolute inset-0 w-full h-[180%] -top-[40%]">
              <Image
                src="/logos/LOGO-BLANCO.png"
                alt={siteConfig.name}
                fill
                className="object-contain object-center hover:opacity-80 transition-opacity"
                priority
              />
            </div>
          </div>
        </Link>

        {/* Nav links — each flex-1, filling navbar equally with logo */}
        <div className="hidden md:contents">
          {allNavLinks.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "group relative flex-1 flex items-center justify-center uppercase tracking-[0.14em] text-white/60 transition-all duration-300",
                "hover:text-white"
              )}
              style={{ fontSize: '18px' }}
            >
              {/* Left border — appears on hover */}
              <span
                className="absolute left-0 top-[15%] bottom-[15%] w-px bg-white/0 group-hover:bg-white/25 transition-all duration-300"
              />
              {link.label}
              {/* Right border — appears on hover */}
              <span
                className="absolute right-0 top-[15%] bottom-[15%] w-px bg-white/0 group-hover:bg-white/25 transition-all duration-300"
              />
              {/* Hover background — warm pale gray */}
              <span
                className="absolute inset-0 bg-[#d4cfc6]/0 group-hover:bg-[#d4cfc6]/8 transition-all duration-300 pointer-events-none"
              />
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 md:hidden p-2 ml-auto flex items-center"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile overlay — fullscreen */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-10 transition-all duration-400 md:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {allNavLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="text-2xl uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
