import type { Metadata } from "next";
import { getPageContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
};

export default async function TerminosPage() {
  const sections = await getPageContent("terminos");
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
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              paddingBottom: "40px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {section.title && (
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
            )}
            {section.body && (
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {section.body}
              </p>
            )}
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
