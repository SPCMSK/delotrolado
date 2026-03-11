import Link from "next/link";
import Image from "next/image";
import { getPublishedEvents, getSiteSettings } from "@/lib/data";

export default async function Home() {
  const [events, settings] = await Promise.all([
    getPublishedEvents(),
    getSiteSettings(),
  ]);
  const upcoming = events.slice(0, 3);

  return (
    <>
      {/* ── HERO ── full viewport height */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden -mt-20 lg:-mt-24">
        {/* Hero background — admin-controlled image, video, or solid black */}
        {settings?.hero_bg_url && settings.hero_bg_type === "video" ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source src={settings.hero_bg_url} />
          </video>
        ) : settings?.hero_bg_url ? (
          <Image
            src={settings.hero_bg_url}
            alt=""
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        {/* Dark overlay for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: settings?.hero_bg_url
              ? "rgba(0,0,0,0.55)"
              : "transparent",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-6 w-full">
          {/* ── Logo central (includes "delotrolado club" text) ── */}
          <div className="animate-fade-in" style={{ marginBottom: '80px' }}>
            <div style={{ width: 'min(70vw, 520px)', height: 'min(70vw, 520px)', margin: '0 auto', position: 'relative' }}>
              <Image
                src="/LOGOS DOL SVG/3.svg"
                alt="delotrolado club"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* ── CTA button ── */}
          <div className="animate-fade-in-delayed">
            <Link
              href="/eventos"
              style={{ padding: '18px 48px' }}
              className="inline-block border border-white text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Ver eventos
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-[1px] h-14 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── CARTELERA ── */}
      <section className="home-cartelera" style={{ padding: '96px 64px' }}>
        <div className="home-cartelera-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '56px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
            Cartelera
          </h2>
          <Link
            href="/eventos"
            className="hover:text-white transition-colors duration-300"
            style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)' }}
          >
            Ver todos →
          </Link>
        </div>

        {upcoming.length > 0 ? (
          <div className="home-events-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(upcoming.length, 3)}, 1fr)`, gap: '2px' }}>
          {upcoming.map((event, i) => (
            <Link
              key={event.slug}
              href={`/eventos/${event.slug}`}
              className="group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '40px 32px',
                backgroundColor: '#0d0d0d',
                minHeight: '280px',
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative',
                overflow: 'hidden',
                animation: `fadeIn 0.6s ease-out ${0.15 * (i + 1)}s both`,
              }}
            >
              {/* Flyer background */}
              {event.flyer_url && (
                <Image
                  src={event.flyer_url}
                  alt={event.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              )}
              {/* Dark overlay for readability */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: event.flyer_url
                    ? 'rgba(0,0,0,0.6)'
                    : 'transparent',
                  pointerEvents: 'none',
                }}
              />
              {/* Hover overlay */}
              <div
                className="group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />

              {/* Top: date + time */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                  {event.dayOfWeek} {event.day} {event.month}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono), monospace' }}>
                  {event.doorsOpen ? `Apertura ${event.doorsOpen}` : ''}
                </p>
              </div>

              {/* Bottom: name + venue + tags */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3
                  className="group-hover:text-white transition-colors duration-300"
                  style={{ fontSize: '20px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}
                >
                  {event.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>
                  {event.venue}
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(event.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '3px 8px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        ) : (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '80px 32px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '15px' }}>
              Próximamente se anunciarán nuevos eventos.
            </p>
          </div>
        )}
      </section>


    </>
  );
}
