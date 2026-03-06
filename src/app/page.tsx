import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* ── HERO ── full viewport height */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden -mt-20 lg:-mt-24">
        <div className="absolute inset-0 bg-black" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 w-full">
          {/* ── Logo central ── */}
          <div className="animate-fade-in" style={{ marginBottom: '56px' }}>
            <div className="relative w-[280px] sm:w-[380px] md:w-[460px] lg:w-[540px] xl:w-[600px] h-[140px] sm:h-[190px] md:h-[230px] lg:h-[270px] xl:h-[300px] mx-auto overflow-hidden">
              <div className="absolute inset-0 w-full h-[180%] -top-[40%]">
                <Image
                  src="/logos/LOGO-BLANCO.png"
                  alt="delotrolado"
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
            </div>
          </div>

          {/* ── Texto principal ── */}
          <div className="animate-fade-in-delayed flex flex-col items-center">

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold uppercase tracking-[0.08em] leading-none" style={{ marginBottom: '20px' }}>
              DELOTROLADO
            </h1>

            <p className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[0.08em] text-white/40" style={{ marginBottom: '100px' }}>
              CLUB
            </p>

            <Link
              href="/eventos"
              className="inline-block border border-white px-16 md:px-20 py-5 md:py-6 text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300"
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
      <section style={{ padding: '96px 64px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '56px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
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

        {/* Event cards — 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
          {[
            { slug: 'noche-rota-vol-4', name: 'Noche Rota Vol. 4', date: 'SÁB 12 ABR', venue: 'Galpón Subterráneo', time: '23:30', tags: ['Techno', 'Hard Groove'] },
            { slug: 'eclipse-total', name: 'Eclipse Total', date: 'SÁB 26 ABR', venue: 'Bodega Norte', time: '00:00', tags: ['Industrial', 'EBM'] },
            { slug: 'ritual-sonoro-ii', name: 'Ritual Sonoro II', date: 'SÁB 10 MAY', venue: 'Espacio Raw', time: '23:00', tags: ['Dub Techno', 'Ambient'] },
          ].map((event, i) => (
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
                  {event.date}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono), monospace' }}>
                  Apertura {event.time}
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
                  {event.tags.map((tag) => (
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
      </section>
    </>
  );
}
