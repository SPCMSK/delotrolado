"use client";

import { useState } from "react";

interface GalleryImage {
  id: string;
  event_id: string | null;
  url: string;
  alt: string | null;
  caption: string | null;
  photographer: string | null;
  is_visible: boolean;
  sort_order: number;
  event?: { name: string; slug: string } | null;
}

interface Props {
  images: GalleryImage[];
  eventNames: string[];
}

export default function GalleryView({ images, eventNames }: Props) {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filtered =
    activeFilter === "Todos"
      ? images
      : images.filter((img) => img.event?.name === activeFilter);

  return (
    <>
      {/* Event filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "48px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {["Todos", ...eventNames].map((filter) => {
          const isActive = filter === activeFilter;
          const count =
            filter === "Todos"
              ? images.length
              : images.filter((img) => img.event?.name === filter).length;

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                background: "none",
                border: "none",
                cursor: "pointer",
                paddingBottom: isActive ? "16px" : undefined,
                borderBottom: isActive ? "1px solid #fff" : undefined,
                marginBottom: isActive ? "-17px" : undefined,
                transition: "color 0.2s",
              }}
            >
              {filter} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "80px 32px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "15px" }}>
            No hay fotos en esta sección.
          </p>
        </div>
      ) : (
        <div className="gallery-grid" style={{ columns: "3", columnGap: "2px" }}>
          {filtered.map((item, i) => (
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
                  }}
                />
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
      )}
    </>
  );
}
