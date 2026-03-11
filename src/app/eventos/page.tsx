import type { Metadata } from "next";
import { getPublishedEventsSplit } from "@/lib/data";
import EventsView from "./events-view";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Cartelera de eventos — delotrolado",
};

export default async function EventosPage() {
  const { upcoming, past } = await getPublishedEventsSplit();

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
          Cartelera
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
          Eventos
        </h1>
      </div>

      <EventsView upcoming={upcoming} past={past} />
    </section>
  );
}
