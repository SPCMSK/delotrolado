import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Cartelera de eventos — delotrolado",
};

export default async function EventosPage() {
  const upcoming = await getPublishedEvents();
  const past: typeof upcoming = [];

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

      {/* Filter tabs */}
      <div
        className="animate-fade-in-delayed filter-tabs"
        style={{
          display: "flex",
          gap: "32px",
          marginBottom: "48px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "16px",
        }}
      >
        <button
          style={{
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#fff",
            background: "none",
            border: "none",
            cursor: "pointer",
            paddingBottom: "16px",
            borderBottom: "1px solid #fff",
            marginBottom: "-17px",
          }}
        >
          Próximos ({upcoming.length})
        </button>
        <button
          style={{
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.3)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Pasados ({past.length})
        </button>
      </div>

      {/* Event list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {upcoming.map((event, i) => (
          <Link
            key={event.slug}
            href={`/eventos/${event.slug}`}
            className="group event-row"
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr auto",
              gap: "40px",
              alignItems: "center",
              padding: "32px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              textDecoration: "none",
              color: "inherit",
              animation: `fadeIn 0.6s ease-out ${0.1 * (i + 1)}s both`,
            }}
          >
            {/* Date block */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {event.dayOfWeek}
              </span>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {event.day}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {event.month}
              </span>
            </div>

            {/* Event info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3
                className="group-hover:text-white transition-colors duration-300"
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {event.name}
              </h3>
              <div className="event-meta" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {event.venue}
                </span>
                <span
                  className="event-meta-sep"
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {event.city}
                </span>
                <span
                  className="event-meta-sep"
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  Apertura {event.doorsOpen}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                {(event.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.35)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px 10px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <span
              className="group-hover:translate-x-1 transition-transform duration-300 event-row-arrow"
              style={{
                fontSize: "20px",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              →
            </span>
          </Link>
        ))}
      </div>

      {upcoming.length === 0 && (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "80px 32px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "15px" }}>
            No hay eventos próximos programados.
          </p>
        </div>
      )}
    </section>
  );
}
