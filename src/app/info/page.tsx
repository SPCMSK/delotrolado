import type { Metadata } from "next";
import { Instagram } from "lucide-react";
import { getPageContent, getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Info",
  description: "Sobre el colectivo delotrolado",
};

export default async function InfoPage() {
  const [content, settings] = await Promise.all([
    getPageContent("info"),
    getSiteSettings(),
  ]);

  const aboutTitle = content.find(c => c.section_key === "about_title");
  const aboutBodies = content
    .filter(c => c.section_key.startsWith("about_body"))
    .sort((a, b) => a.sort_order - b.sort_order);
  const contactIntro = content.find(c => c.section_key === "contact_intro");
  const location = content.find(c => c.section_key === "location");

  const email = settings?.contact_email || "contacto@delotrolado.club";
  const instagram = settings?.instagram_url || "https://www.instagram.com/__delotrolado/";
  const ethos = settings?.ethos_text || "No fotos · No flash · No teléfonos en pista";

  return (
    <section className="page-section page-section-top" style={{ padding: "48px 64px 96px" }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: "80px" }}>
        <p
          style={{
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.3)",
            marginBottom: "16px",
          }}
        >
          Sobre nosotros
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
          Info
        </h1>
      </div>

      {/* Two-column layout */}
      <div
        className="animate-fade-in-delayed info-layout"
        style={{ display: "flex", gap: "96px" }}
      >
        {/* Left column — About */}
        <div style={{ flex: "1 1 55%" }}>
          <div style={{ maxWidth: "560px" }}>
            <h2
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.25)",
                marginBottom: "32px",
              }}
            >
              {aboutTitle?.title || "¿Qué es delotrolado?"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {aboutBodies.map((block) => (
                <p
                  key={block.id}
                  style={{
                    fontSize: "17px",
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {block.body}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Contact & Details */}
        <div style={{ flex: "1 1 35%", display: "flex", flexDirection: "column", gap: "56px" }}>
          {/* Contact */}
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
              {contactIntro?.title || "Contacto"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)" }}>
                {contactIntro?.body || "Consultas generales, prensa y booking:"}
              </p>
              <a
                href={`mailto:${email}`}
                className="hover:text-white transition-colors duration-300"
                style={{
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  textDecorationColor: "rgba(255,255,255,0.2)",
                }}
              >
                {email}
              </a>
            </div>
          </div>

          {/* Social */}
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
              Redes
            </h2>
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-300"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "15px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <Instagram size={20} />
              @__delotrolado
            </a>
          </div>

          {/* Location */}
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
              {location?.title || "Ubicación"}
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              {location?.body || "Valparaíso / Santiago, Chile"}
            </p>
          </div>

          {/* Ethos */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "32px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.2)",
                lineHeight: 2,
              }}
            >
              {ethos}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
