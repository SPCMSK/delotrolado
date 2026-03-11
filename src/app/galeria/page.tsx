import type { Metadata } from "next";
import { getGalleryImages } from "@/lib/data";
import GalleryView from "./gallery-view";

export const metadata: Metadata = {
  title: "Galería",
  description: "Fotos y videos de eventos — delotrolado",
};

export default async function GaleriaPage() {
  const gallery = await getGalleryImages();

  /* Extract unique event names for filter tabs */
  const eventNames = Array.from(new Set(gallery.map((g) => g.event?.name).filter(Boolean))) as string[];

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

      <GalleryView images={gallery} eventNames={eventNames} />
    </section>
  );
}
