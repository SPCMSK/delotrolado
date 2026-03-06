import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
};

const sections = [
  {
    title: "1. Datos recopilados",
    body: "Al comprar entradas en delotrolado.club, recopilamos la información necesaria para procesar tu compra: nombre, correo electrónico y datos de contacto. No almacenamos información financiera — los pagos son procesados íntegramente por MercadoPago.",
  },
  {
    title: "2. Uso de la información",
    body: "Tu información se utiliza exclusivamente para: procesar y confirmar tu compra de entradas, enviarte la entrada digital con código QR, contactarte en caso de cambios o cancelación del evento.",
  },
  {
    title: "3. Compartición de datos",
    body: "No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto con MercadoPago para el procesamiento de pagos y cuando sea requerido por ley.",
  },
  {
    title: "4. Seguridad",
    body: "Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos: cifrado HTTPS en todas las comunicaciones, acceso restringido a la base de datos, y verificación de integridad en todas las transacciones.",
  },
  {
    title: "5. Tus derechos",
    body: "Puedes solicitar acceso, rectificación o eliminación de tus datos personales en cualquier momento escribiendo a contacto@delotrolado.club.",
  },
  {
    title: "6. Cookies",
    body: "Este sitio utiliza cookies esenciales para su funcionamiento (autenticación, sesión de compra). No utilizamos cookies de seguimiento ni publicidad de terceros.",
  },
];

export default function PrivacidadPage() {
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
          Política de Privacidad
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
