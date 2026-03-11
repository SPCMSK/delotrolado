"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, type EventInput } from "@/lib/admin-actions";
import { uploadImage } from "@/lib/storage";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    date: string;
    doors_open: string | null;
    doors_close: string | null;
    venue: string;
    address: string | null;
    city: string;
    flyer_url: string | null;
    hero_url: string | null;
    status: string;
    tags: string[] | null;
    min_age: number | null;
    is_featured: boolean;
    is_past: boolean;
  };
}

export function EventForm({ initialData }: Props) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    date: initialData?.date ?? "",
    doors_open: initialData?.doors_open?.slice(0, 5) ?? "",
    doors_close: initialData?.doors_close?.slice(0, 5) ?? "",
    venue: initialData?.venue ?? "",
    address: initialData?.address ?? "",
    city: initialData?.city ?? "Valparaíso",
    flyer_url: initialData?.flyer_url ?? "",
    hero_url: initialData?.hero_url ?? "",
    status: initialData?.status ?? "draft",
    tags: (initialData?.tags ?? []).join(", "),
    min_age: initialData?.min_age?.toString() ?? "18",
    is_featured: initialData?.is_featured ?? false,
    is_past: initialData?.is_past ?? false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState(initialData?.flyer_url ?? "");
  const [heroPreview, setHeroPreview] = useState(initialData?.hero_url ?? "");

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !isEditing) {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setMessage(null);
  }

  function handleFileChange(
    field: "flyer" | "hero",
    file: File | null
  ) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (field === "flyer") {
      setFlyerFile(file);
      setFlyerPreview(url);
    } else {
      setHeroFile(file);
      setHeroPreview(url);
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Requerido";
    if (!form.slug.trim()) errs.slug = "Requerido";
    else if (!/^[a-z0-9-]+$/.test(form.slug))
      errs.slug = "Solo letras minúsculas, números y guiones";
    if (!form.date) errs.date = "Requerida";
    if (!form.venue.trim()) errs.venue = "Requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      let flyerUrl = form.flyer_url;
      let heroUrl = form.hero_url;

      if (flyerFile) {
        flyerUrl = await uploadImage("flyers", flyerFile);
      }
      if (heroFile) {
        heroUrl = await uploadImage("flyers", heroFile);
      }

      const data: EventInput = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        date: form.date,
        doors_open: form.doors_open || null,
        doors_close: form.doors_close || null,
        venue: form.venue.trim(),
        address: form.address.trim() || null,
        city: form.city.trim() || "Valparaíso",
        flyer_url: flyerUrl || null,
        hero_url: heroUrl || null,
        status: form.status,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        min_age: form.min_age ? parseInt(form.min_age) : null,
        is_featured: form.is_featured,
        is_past: form.is_past,
      };

      const result = isEditing
        ? await updateEvent(initialData!.id, data)
        : await createEvent(data);

      if ("error" in result) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: isEditing ? "Evento actualizado correctamente" : "Evento creado correctamente",
        });
        if (!isEditing) {
          setTimeout(() => router.push("/admin/eventos"), 1000);
        }
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setSubmitting(false);
    }
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

  const errorStyle: React.CSSProperties = {
    fontSize: "0.6875rem",
    color: "#ef4444",
    marginTop: "0.25rem",
  };

  const fieldWrap: React.CSSProperties = {
    marginBottom: "1.25rem",
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Status message */}
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Name */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Nombre *</label>
          <input
            className="admin-input"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Noche Rota Vol. 5"
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
        </div>

        {/* Slug */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Slug *</label>
          <input
            className="admin-input"
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder="noche-rota-vol-5"
          />
          {errors.slug && <div style={errorStyle}>{errors.slug}</div>}
        </div>
      </div>

      {/* Description */}
      <div style={fieldWrap}>
        <label style={labelStyle}>Descripción</label>
        <textarea
          className="admin-input"
          rows={4}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Descripción del evento..."
          style={{ resize: "vertical" }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Date */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Fecha *</label>
          <input
            className="admin-input"
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          {errors.date && <div style={errorStyle}>{errors.date}</div>}
        </div>

        {/* Doors Open */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Apertura</label>
          <input
            className="admin-input"
            type="time"
            value={form.doors_open}
            onChange={(e) => handleChange("doors_open", e.target.value)}
          />
        </div>

        {/* Doors Close */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Cierre</label>
          <input
            className="admin-input"
            type="time"
            value={form.doors_close}
            onChange={(e) => handleChange("doors_close", e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Venue */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Venue *</label>
          <input
            className="admin-input"
            value={form.venue}
            onChange={(e) => handleChange("venue", e.target.value)}
            placeholder="Galpón Subterráneo"
          />
          {errors.venue && <div style={errorStyle}>{errors.venue}</div>}
        </div>

        {/* Address */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Dirección</label>
          <input
            className="admin-input"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Calle 123"
          />
        </div>

        {/* City */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Ciudad</label>
          <input
            className="admin-input"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Valparaíso"
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Status */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Estado</label>
          <select
            className="admin-input"
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Tags */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Tags (separar con coma)</label>
          <input
            className="admin-input"
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            placeholder="Techno, Industrial"
          />
        </div>

        {/* Min Age */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Edad mínima</label>
          <input
            className="admin-input"
            type="number"
            value={form.min_age}
            onChange={(e) => handleChange("min_age", e.target.value)}
            min={0}
          />
        </div>

        {/* Featured */}
        <div style={{ ...fieldWrap, display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1.5rem" }}>
          <input
            type="checkbox"
            id="is_featured"
            checked={form.is_featured}
            onChange={(e) => handleChange("is_featured", e.target.checked)}
            style={{ accentColor: "#fff" }}
          />
          <label htmlFor="is_featured" style={{ fontSize: "0.8125rem", color: "#aaa" }}>
            Destacado
          </label>
        </div>

        {/* Temporalidad */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Temporalidad</label>
          <select
            className="admin-input"
            value={form.is_past ? "past" : "upcoming"}
            onChange={(e) => handleChange("is_past", e.target.value === "past")}
          >
            <option value="upcoming">Próximo / Vigente</option>
            <option value="past">Evento pasado</option>
          </select>
        </div>
      </div>

      {/* Image uploads */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Flyer */}
        <div>
          <label style={labelStyle}>Flyer</label>
          <div
            style={{
              border: "1px dashed #333",
              borderRadius: "0.375rem",
              padding: "1rem",
              textAlign: "center",
              cursor: "pointer",
              background: "#0a0a0a",
              minHeight: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={() => document.getElementById("flyer-input")?.click()}
          >
            {flyerPreview ? (
              <img
                src={flyerPreview}
                alt="Flyer preview"
                style={{
                  maxHeight: "200px",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span style={{ color: "#555", fontSize: "0.8125rem" }}>
                Click para subir flyer
              </span>
            )}
          </div>
          <input
            id="flyer-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange("flyer", e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Hero */}
        <div>
          <label style={labelStyle}>Hero Image</label>
          <div
            style={{
              border: "1px dashed #333",
              borderRadius: "0.375rem",
              padding: "1rem",
              textAlign: "center",
              cursor: "pointer",
              background: "#0a0a0a",
              minHeight: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
            onClick={() => document.getElementById("hero-input")?.click()}
          >
            {heroPreview ? (
              <img
                src={heroPreview}
                alt="Hero preview"
                style={{
                  maxHeight: "200px",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span style={{ color: "#555", fontSize: "0.8125rem" }}>
                Click para subir hero
              </span>
            )}
          </div>
          <input
            id="hero-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileChange("hero", e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {/* Submit */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          paddingTop: "0.5rem",
          borderTop: "1px solid #1a1a1a",
          marginTop: "0.5rem",
        }}
      >
        <button
          type="submit"
          disabled={submitting}
          className="admin-btn admin-btn-primary"
        >
          {submitting
            ? "Guardando…"
            : isEditing
            ? "Actualizar evento"
            : "Crear evento"}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => router.push("/admin/eventos")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
