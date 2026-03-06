import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Evento",
};

interface EventoSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventoSlugPage({ params }: EventoSlugPageProps) {
  const { slug } = await params;
  const eventName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <section style={{ padding: "0 0 96px" }}>
      {/* Hero area — full width, event flyer placeholder */}
      <div
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
          className="animate-fade-in"
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
            {eventName}
          </h1>
        </div>
      </div>

      {/* Content: 2 columns — details + ticket module */}
      <div
        className="animate-fade-in-delayed"
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
            style={{
              display: "flex",
              gap: "40px",
              paddingBottom: "32px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { label: "Fecha", value: "12 Abril 2026" },
              { label: "Apertura", value: "23:30 hs" },
              { label: "Cierre", value: "07:00 hs" },
              { label: "Venue", value: "Galpón Subterráneo" },
              { label: "Ciudad", value: "Valparaíso" },
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
              Descripción del evento se cargará desde la base de datos. Aquí irá
              un texto descriptivo sobre la temática de la noche, el concepto
              detrás de la fiesta y qué pueden esperar los asistentes.
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
              {[
                { name: "KRA", time: "23:30 – 01:00", type: "DJ Set" },
                { name: "MURO", time: "01:00 – 03:00", type: "DJ Set" },
                { name: "RAW MATERIAL", time: "03:00 – 04:30", type: "Live" },
                { name: "SOMBRA", time: "04:30 – 07:00", type: "DJ Set" },
              ].map((artist) => (
                <div
                  key={artist.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span
                      style={{
                        fontSize: "17px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      {artist.name}
                    </span>
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
                      {artist.type}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    {artist.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Ticket module */}
        <div style={{ flex: "1 1 35%", maxWidth: "400px" }}>
          <div
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
            {[
              { name: "Early Bird", price: "$5.000", status: "Agotado" },
              { name: "General", price: "$8.000", status: "Disponible" },
              { name: "Puerta", price: "$12.000", status: "En puerta" },
            ].map((tier) => (
              <div
                key={tier.name}
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
                      color:
                        tier.status === "Agotado"
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
                    {tier.status}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color:
                      tier.status === "Agotado"
                        ? "rgba(255,255,255,0.2)"
                        : "#fff",
                    textDecoration:
                      tier.status === "Agotado" ? "line-through" : "none",
                  }}
                >
                  {tier.price}
                </span>
              </div>
            ))}

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
      <div style={{ padding: "64px 64px 0" }}>
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
