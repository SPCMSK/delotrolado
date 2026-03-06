import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
};

const sections = [
  {
    title: "1. Generalidades",
    body: "Los presentes Términos y Condiciones regulan el uso del sitio web delotrolado.club y la compra de entradas a eventos organizados por el colectivo delotrolado.",
  },
  {
    title: "2. Compra de entradas",
    body: "Las entradas son personales e intransferibles. Cada entrada genera un código QR único que será validado al ingreso del evento. La reventa de entradas está estrictamente prohibida.",
  },
  {
    title: "3. Pagos",
    body: "Todos los pagos se procesan a través de MercadoPago. delotrolado no almacena datos de tarjetas de crédito ni información financiera sensible.",
  },
  {
    title: "4. Política de reembolso",
    body: "Las entradas no son reembolsables salvo cancelación del evento por parte del organizador. En caso de cancelación, se realizará la devolución completa del monto pagado a través del mismo medio de pago utilizado.",
  },
  {
    title: "5. Derecho de admisión",
    body: "El colectivo delotrolado se reserva el derecho de admisión. La compra de una entrada no garantiza el ingreso al evento en caso de incumplimiento de las normas del recinto.",
  },
  {
    title: "6. Responsabilidad",
    body: "El asistente es responsable de su comportamiento dentro del evento. delotrolado no se hace responsable por objetos perdidos o daños personales ocurridos durante el evento.",
  },
];

export default function TerminosPage() {
  return (
    <section className="page-section page-section-top" style={{ padding: "48px 64px 96px", maxWidth: "800px" }}>
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
          Legal
        </p>
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Términos y Condiciones
        </h1>
      </div>

      {/* Sections */}
      <div
        className="animate-fade-in-delayed"
        style={{ display: "flex", flexDirection: "column", gap: "40px" }}
      >
        {sections.map((section, i) => (
          <div
            key={i}
            style={{
              paddingBottom: "40px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                marginBottom: "16px",
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {section.body}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginTop: "48px",
        }}
      >
        Última actualización: Marzo 2026
      </p>
    </section>
  );
}
