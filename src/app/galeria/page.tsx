import type { Metadata } from "next";
import { getGalleryImages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Galería",
  description: "Fotos y videos de eventos — delotrolado",
};

export default async function GaleriaPage() {
  const gallery = await getGalleryImages();

  /* Extract unique event names for filter tabs */
  const eventNames = Array.from(new Set(gallery.map((g) => g.event?.name).filter(Boolean))) as string[];
  return (
    <section style={{ padding: "48px 64px 96px" }}>
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
          Archivo visual
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
          Galería
        </h1>
      </div>

      {/* Event filter */}
      <div
        className="animate-fade-in-delayed"
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "48px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {["Todos", ...eventNames].map(
          (filter, i) => (
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
          )
        )}
      </div>

      {/* Masonry-style grid — 3 columns */}
      <div
        style={{
          columns: "3",
          columnGap: "2px",
        }}
      >
        {gallery.map((item, i) => (
          <div
            key={item.id}
            className="group"
            style={{
              breakInside: "avoid",
              marginBottom: "2px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              animation: `fadeIn 0.5s ease-out ${0.06 * (i + 1)}s both`,
            }}
          >
            {/* Photo area */}
            {item.url ? (
              <img
                src={item.url}
                alt={item.alt ?? "Galería"}
                style={{ width: "100%", display: "block" }}
              />
            ) : (
              <div
                style={{
                  aspectRatio: "4/5",
                  backgroundColor: `hsl(0, 0%, ${8 + (i % 3) * 2}%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    position: "absolute",
                    inset: 0,
                  }}
                />
              </div>
            )}

            {/* Overlay on hover */}
            <div
              className="group-hover:opacity-100 transition-opacity duration-300"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(transparent 40%, rgba(0,0,0,0.8) 100%)",
                opacity: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#fff",
                }}
              >
                {item.event?.name ?? ""}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "4px",
                }}
              >
                {item.photographer ? `Foto: ${item.photographer}` : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
