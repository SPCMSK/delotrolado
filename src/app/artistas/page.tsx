import type { Metadata } from "next";
import Link from "next/link";
import { getArtists, roleLabel } from "@/lib/data";

export const metadata: Metadata = {
  title: "Artistas",
  description: "Residentes e invitados — delotrolado",
};

export default async function ArtistasPage() {
  const artists = await getArtists();
  return (
    <section className="page-section page-section-top" style={{ padding: "48px 64px 96px" }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: "64px" }}>
        <p
          style={{
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.3)",
            marginBottom: "16px",
          }}
        >
          Colectivo
        </p>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Artistas
        </h1>
      </div>

      {/* Role filter */}
      <div
        className="animate-fade-in-delayed filter-tabs"
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "48px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "16px",
        }}
      >
        {["Todos", "Residentes", "Invitados", "Live"].map((filter, i) => (
          <button
            key={filter}
            style={{
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: i === 0 ? "#fff" : "rgba(255,255,255,0.3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              paddingBottom: i === 0 ? "16px" : undefined,
              borderBottom: i === 0 ? "1px solid #fff" : undefined,
              marginBottom: i === 0 ? "-17px" : undefined,
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Artists grid */}
      <div
        className="artists-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "2px",
        }}
      >
        {artists.map((artist, i) => (
          <Link
            key={artist.slug}
            href={`/artistas/${artist.slug}`}
            className="group"
            style={{
              position: "relative",
              aspectRatio: "1",
              backgroundColor: "#111",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              animation: `fadeIn 0.5s ease-out ${0.06 * (i + 1)}s both`,
            }}
          >
            {/* Large initial letter as background texture */}
            <span
              className="group-hover:scale-110 transition-transform duration-700"
              style={{
                position: "absolute",
                fontSize: "180px",
                fontWeight: 800,
                color: "rgba(255,255,255,0.03)",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {artist.name.charAt(0)}
            </span>

            {/* Hover overlay */}
            <div
              className="group-hover:opacity-100 transition-opacity duration-300"
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255,255,255,0.04)",
                opacity: 0,
              }}
            />

            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {artist.name}
              </h3>
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                {roleLabel(artist.role)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
