import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Artista",
};

interface ArtistaSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtistaSlugPage({
  params,
}: ArtistaSlugPageProps) {
  const { slug } = await params;
  const artistName = slug
    .replace(/-/g, " ")
    .toUpperCase();

  return (
    <section style={{ padding: "48px 64px 96px" }}>
      {/* Back link */}
      <div className="animate-fade-in" style={{ marginBottom: "48px" }}>
        <Link
          href="/artistas"
          className="hover:text-white transition-colors duration-300"
          style={{
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          ← Artistas
        </Link>
      </div>

      {/* Artist layout — two columns */}
      <div
        className="animate-fade-in-delayed"
        style={{ display: "flex", gap: "80px" }}
      >
        {/* Left — Photo placeholder */}
        <div style={{ flex: "1 1 45%" }}>
          <div
            style={{
              aspectRatio: "3/4",
              backgroundColor: "#111",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            {/* Large initial */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "200px",
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.03)",
                  userSelect: "none",
                }}
              >
                {artistName.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Right — Bio & info */}
        <div
          style={{
            flex: "1 1 50%",
            display: "flex",
            flexDirection: "column",
            gap: "48px",
            paddingTop: "16px",
          }}
        >
          {/* Name + role */}
          <div>
            <p
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.25)",
                marginBottom: "16px",
              }}
            >
              Artista
            </p>
            <h1
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: "16px",
              }}
            >
              {artistName}
            </h1>
            <span
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "6px 14px",
                display: "inline-block",
              }}
            >
              Residente
            </span>
          </div>

          {/* Bio */}
          <div>
            <h2
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.25)",
                marginBottom: "24px",
              }}
            >
              Bio
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.5)",
                maxWidth: "520px",
              }}
            >
              La biografía del artista se cargará desde la base de datos. Aquí
              se mostrará información sobre su trayectoria, estilo musical e
              influencias.
            </p>
          </div>

          {/* Links */}
          <div>
            <h2
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.25)",
                marginBottom: "24px",
              }}
            >
              Links
            </h2>
            <div style={{ display: "flex", gap: "24px" }}>
              {["SoundCloud", "Instagram", "Resident Advisor"].map((link) => (
                <span
                  key={link}
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.35)",
                    textDecoration: "underline",
                    textUnderlineOffset: "4px",
                    textDecorationColor: "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                  }}
                >
                  {link}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div>
            <h2
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.25)",
                marginBottom: "24px",
              }}
            >
              Próximos eventos
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { name: "Noche Rota Vol. 4", date: "12 Abr 2026", venue: "Galpón Subterráneo" },
                { name: "Ritual Sonoro II", date: "10 May 2026", venue: "Espacio Raw" },
              ].map((event) => (
                <div
                  key={event.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {event.name}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.3)",
                        marginTop: "4px",
                      }}
                    >
                      {event.venue}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    {event.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
