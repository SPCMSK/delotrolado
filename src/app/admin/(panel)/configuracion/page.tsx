"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { updateSiteSettings } from "@/lib/admin-actions";
import { uploadImage } from "@/lib/storage";

interface Settings {
  id: string;
  site_name: string;
  site_tagline: string | null;
  site_description: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  ra_url: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  hero_bg_url: string | null;
  hero_bg_type: string | null;
  footer_text: string | null;
  ethos_text: string | null;
  min_age_default: number | null;
  currency: string;
  timezone: string;
}

export default function AdminConfiguracionPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowser();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        setMessage({ type: "error", text: `Error: ${error.message}` });
      } else {
        setSettings(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    const result = await updateSiteSettings({
      site_name: settings.site_name,
      site_tagline: settings.site_tagline,
      site_description: settings.site_description,
      contact_email: settings.contact_email,
      instagram_url: settings.instagram_url,
      soundcloud_url: settings.soundcloud_url,
      ra_url: settings.ra_url,
      logo_url: settings.logo_url,
      logo_dark_url: settings.logo_dark_url,
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      hero_cta_text: settings.hero_cta_text,
      hero_cta_link: settings.hero_cta_link,
      hero_bg_url: settings.hero_bg_url,
      hero_bg_type: settings.hero_bg_type,
      footer_text: settings.footer_text,
      ethos_text: settings.ethos_text,
      min_age_default: settings.min_age_default,
      currency: settings.currency,
      timezone: settings.timezone,
    });

    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Configuración guardada" });
    }
    setSaving(false);
  }

  function update(field: keyof Settings, value: string | number | null) {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
    setMessage(null);
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#888",
    marginBottom: "0.375rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const fieldWrap: React.CSSProperties = { marginBottom: "1.25rem" };

  if (loading) return <div style={{ color: "#666" }}>Cargando…</div>;
  if (!settings)
    return <div style={{ color: "#ef4444" }}>No se pudo cargar la configuración</div>;

  const sections = [
    {
      title: "General",
      fields: [
        { key: "site_name", label: "Nombre del sitio", type: "text" },
        { key: "site_tagline", label: "Tagline", type: "text" },
        { key: "site_description", label: "Descripción", type: "textarea" },
        { key: "contact_email", label: "Email de contacto", type: "email" },
      ],
    },
    {
      title: "Hero (Portada)",
      fields: [
        { key: "hero_title", label: "Título hero", type: "text" },
        { key: "hero_subtitle", label: "Subtítulo hero", type: "text" },
        { key: "hero_cta_text", label: "Texto botón CTA", type: "text" },
        { key: "hero_cta_link", label: "Link botón CTA", type: "text" },
        { key: "hero_bg_type", label: "Tipo de fondo (image / video)", type: "text" },
        { key: "hero_bg_url", label: "URL del fondo (o subir abajo)", type: "text" },
        { key: "ethos_text", label: "Texto ethos", type: "text" },
      ],
    },
    {
      title: "Logos",
      fields: [
        { key: "logo_url", label: "Logo (claro)", type: "text" },
        { key: "logo_dark_url", label: "Logo (oscuro)", type: "text" },
      ],
    },
    {
      title: "Redes Sociales",
      fields: [
        { key: "instagram_url", label: "Instagram URL", type: "url" },
        { key: "soundcloud_url", label: "SoundCloud URL", type: "url" },
        { key: "ra_url", label: "Resident Advisor URL", type: "url" },
      ],
    },
    {
      title: "Footer",
      fields: [
        { key: "footer_text", label: "Texto del footer", type: "textarea" },
      ],
    },
    {
      title: "Configuración regional",
      fields: [
        { key: "min_age_default", label: "Edad mínima por defecto", type: "number" },
        { key: "currency", label: "Moneda", type: "text" },
        { key: "timezone", label: "Zona horaria", type: "text" },
      ],
    },
  ];

  return (
    <div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "0.25rem",
        }}
      >
        Configuración
      </h1>
      <p
        style={{ fontSize: "0.8125rem", color: "#666", marginBottom: "2rem" }}
      >
        Configuración general del sitio
      </p>

      {message && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            borderRadius: "0.375rem",
            fontSize: "0.8125rem",
            background:
              message.type === "error"
                ? "rgba(239,68,68,0.1)"
                : "rgba(34,197,94,0.1)",
            border: `1px solid ${
              message.type === "error"
                ? "rgba(239,68,68,0.3)"
                : "rgba(34,197,94,0.3)"
            }`,
            color: message.type === "error" ? "#ef4444" : "#22c55e",
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave}>
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              background: "#111",
              border: "1px solid #1a1a1a",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                marginBottom: "1.25rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {section.title}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: section.fields.length === 1 ? "1fr" : "1fr 1fr",
                gap: "1rem",
              }}
            >
              {section.fields.map((field) => (
                <div
                  key={field.key}
                  style={{
                    ...fieldWrap,
                    gridColumn: field.type === "textarea" ? "1 / -1" : undefined,
                  }}
                >
                  <label style={labelStyle}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      className="admin-input"
                      rows={3}
                      value={
                        (settings[field.key as keyof Settings] as string) ?? ""
                      }
                      onChange={(e) =>
                        update(
                          field.key as keyof Settings,
                          e.target.value || null
                        )
                      }
                      style={{ resize: "vertical" }}
                    />
                  ) : field.type === "number" ? (
                    <input
                      className="admin-input"
                      type="number"
                      value={
                        (settings[field.key as keyof Settings] as number) ?? ""
                      }
                      onChange={(e) =>
                        update(
                          field.key as keyof Settings,
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    />
                  ) : (
                    <input
                      className="admin-input"
                      type={field.type}
                      value={
                        (settings[field.key as keyof Settings] as string) ?? ""
                      }
                      onChange={(e) =>
                        update(
                          field.key as keyof Settings,
                          e.target.value || null
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Hero background upload section */}
        <div
          style={{
            background: "#111",
            border: "1px solid #1a1a1a",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "1.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Subir fondo Hero (imagen o video)
          </h2>

          {settings.hero_bg_url && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem" }}>
                Fondo actual ({settings.hero_bg_type || "image"}):
              </p>
              {settings.hero_bg_type === "video" ? (
                <video
                  src={settings.hero_bg_url}
                  style={{ maxWidth: "320px", borderRadius: "0.375rem", border: "1px solid #333" }}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={settings.hero_bg_url}
                  alt="Hero background"
                  style={{ maxWidth: "320px", borderRadius: "0.375rem", border: "1px solid #333" }}
                />
              )}
            </div>
          )}

          <input
            type="file"
            accept="image/*,video/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              setMessage(null);
              const isVideo = file.type.startsWith("video/");

              try {
                const url = await uploadImage("site", file);
                update("hero_bg_url", url);
                update("hero_bg_type", isVideo ? "video" : "image");
                setMessage({ type: "success", text: `Fondo ${isVideo ? "video" : "imagen"} subido. Guardá para aplicar.` });
              } catch (err) {
                setMessage({
                  type: "error",
                  text: `Error al subir: ${err instanceof Error ? err.message : "Error desconocido"}`,
                });
              }
            }}
            className="admin-input"
            style={{ cursor: "pointer" }}
          />
          <p style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.5rem" }}>
            Formatos: JPG, PNG, WebP, MP4, WebM. Recomendado: 1920x1080 o más.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="admin-btn admin-btn-primary"
        >
          {saving ? "Guardando…" : "Guardar configuración"}
        </button>
      </form>
    </div>
  );
}
