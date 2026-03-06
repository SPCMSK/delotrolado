import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEventBySlug,
  getEventLineup,
  getTicketTypes,
  formatPrice,
  ticketStatus,
  formatDateLong,
  roleLabel,
} from "@/lib/data";

interface EventoSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventoSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado" };
  return { title: event.name, description: event.description ?? `${event.name} — delotrolado` };
}

export default async function EventoSlugPage({ params }: EventoSlugPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const [lineup, tickets] = await Promise.all([
    getEventLineup(event.id),
    getTicketTypes(event.id),
  ]);

  return (
    <section style={{ padding: "0 0 96px" }}>
      {/* Hero area — full width, event flyer placeholder */}
      <div
        className="event-hero"
        style={{
          position: "relative",
          width: "100%",
          height: "420px",
          backgroundColor: "#0d0d0d",
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Grid texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Gradient bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "linear-gradient(transparent, #000)",
          }}
        />

        {/* Event title over hero */}
        <div
          className="animate-fade-in event-hero-title"
          style={{ position: "relative", zIndex: 1, padding: "0 64px 48px" }}
        >
          <p
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "16px",
            }}
          >
            Evento
          </p>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {event.name}
          </h1>
        </div>
      </div>

      {/* Content: 2 columns — details + ticket module */}
      <div
        className="animate-fade-in-delayed event-detail-content"
        style={{
          display: "flex",
          gap: "64px",
          padding: "64px 64px 0",
        }}
      >
        {/* Left — Event details */}
        <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", gap: "48px" }}>
          {/* Event info strip */}
          <div
            className="event-info-strip"
            style={{
              display: "flex",
              gap: "40px",
              paddingBottom: "32px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { label: "Fecha", value: formatDateLong(event.date) },
              { label: "Apertura", value: event.doorsOpen ? `${event.doorsOpen} hs` : "—" },
              { label: "Cierre", value: event.doorsClose ? `${event.doorsClose} hs` : "—" },
              { label: "Venue", value: event.venue },
              { label: "Ciudad", value: event.city },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "rgba(255,255,255,0.25)",
                    marginBottom: "8px",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 500,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
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
              Sobre el evento
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.5)",
                maxWidth: "600px",
              }}
            >
              {event.description ?? "Información del evento próximamente."}
            </p>
          </div>

          {/* Lineup */}
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
              Lineup
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0",
              }}
            >
              {lineup.map((entry) => (
                <div
                  key={entry.id}
                  className="lineup-entry"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <Link
                      href={`/artistas/${entry.artist.slug}`}
                      className="hover:text-white transition-colors duration-300"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <span
                        style={{
                          fontSize: "17px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "rgba(255,255,255,0.8)",
                        }}
                      >
                        {entry.artist.name}
                      </span>
                    </Link>
                    <span
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "rgba(255,255,255,0.25)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "3px 8px",
                      }}
                    >
                      {entry.set_type}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    {entry.set_time && entry.set_end ? `${entry.set_time} – ${entry.set_end}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Ticket module */}
        <div style={{ flex: "1 1 35%", maxWidth: "400px" }}>
          <div
            className="ticket-module"
            style={{
              position: "sticky",
              top: "120px",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "32px",
            }}
          >
            <h3
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              Entradas
            </h3>

            {/* Ticket tiers */}
            {tickets.map((tier) => {
              const status = ticketStatus(tier);
              const soldOut = status === "Agotado";
              return (
              <div
                key={tier.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: soldOut
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.8)",
                    }}
                  >
                    {tier.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.3)",
                      marginTop: "4px",
                    }}
                  >
                    {status}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: soldOut
                      ? "rgba(255,255,255,0.2)"
                      : "#fff",
                    textDecoration: soldOut ? "line-through" : "none",
                  }}
                >
                  {formatPrice(tier.price)}
                </span>
              </div>
              );
            })}

            {/* Buy button */}
            <button
              style={{
                width: "100%",
                padding: "18px",
                backgroundColor: "#fff",
                color: "#000",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                cursor: "pointer",
              }}
            >
              Comprar entrada
            </button>

            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.2)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Pago seguro vía MercadoPago.
              <br />
              Recibirás tu entrada con código QR por email.
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="event-back-link" style={{ padding: "64px 64px 0" }}>
        <Link
          href="/eventos"
          className="hover:text-white transition-colors duration-300"
          style={{
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          ← Volver a eventos
        </Link>
      </div>
    </section>
  );
}
