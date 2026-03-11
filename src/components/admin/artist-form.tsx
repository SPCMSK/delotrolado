"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createArtist,
  updateArtist,
  deleteArtist,
  type ArtistInput,
} from "@/lib/admin-actions";
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
    role: string;
    bio: string | null;
    photo_url: string | null;
    instagram_url: string | null;
    soundcloud_url: string | null;
    ra_url: string | null;
    bandcamp_url: string | null;
    website_url: string | null;
    genres: string[] | null;
    sort_order: number;
    is_visible: boolean;
  };
}

export function ArtistForm({ initialData }: Props) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    role: initialData?.role ?? "dj",
    bio: initialData?.bio ?? "",
    photo_url: initialData?.photo_url ?? "",
    instagram_url: initialData?.instagram_url ?? "",
    soundcloud_url: initialData?.soundcloud_url ?? "",
    ra_url: initialData?.ra_url ?? "",
    bandcamp_url: initialData?.bandcamp_url ?? "",
    website_url: initialData?.website_url ?? "",
    genres: (initialData?.genres ?? []).join(", "),
    sort_order: String(initialData?.sort_order ?? 0),
    is_visible: initialData?.is_visible ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(
    initialData?.photo_url ?? ""
  );

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

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Requerido";
    if (!form.slug.trim()) errs.slug = "Requerido";
    else if (!/^[a-z0-9-]+$/.test(form.slug))
      errs.slug = "Solo letras minúsculas, números y guiones";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      let photoUrl = form.photo_url;
      if (photoFile) {
        photoUrl = await uploadImage("artists", photoFile);
      }

      const data: ArtistInput = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        role: form.role,
        bio: form.bio.trim() || null,
        photo_url: photoUrl || null,
        instagram_url: form.instagram_url.trim() || null,
        soundcloud_url: form.soundcloud_url.trim() || null,
        ra_url: form.ra_url.trim() || null,
        bandcamp_url: form.bandcamp_url.trim() || null,
        website_url: form.website_url.trim() || null,
        genres: form.genres
          ? form.genres
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean)
          : [],
        sort_order: parseInt(form.sort_order) || 0,
        is_visible: form.is_visible,
      };

      const result = isEditing
        ? await updateArtist(initialData!.id, data)
        : await createArtist(data);

      if ("error" in result) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: isEditing
            ? "Artista actualizado correctamente"
            : "Artista creado correctamente",
        });
        if (!isEditing) {
          setTimeout(() => router.push("/admin/artistas"), 1000);
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

  async function handleDelete() {
    if (!initialData?.id) return;
    if (!confirm(`¿Eliminar artista "${initialData.name}"?`)) return;

    setSubmitting(true);
    const result = await deleteArtist(initialData.id);
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
      setSubmitting(false);
    } else {
      router.push("/admin/artistas");
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

  const fieldWrap: React.CSSProperties = { marginBottom: "1.25rem" };

  return (
    <form onSubmit={handleSubmit}>
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

      <div className="admin-grid-3">
        <div style={fieldWrap}>
          <label style={labelStyle}>Nombre *</label>
          <input
            className="admin-input"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="KRA"
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Slug *</label>
          <input
            className="admin-input"
            value={form.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            placeholder="kra"
          />
          {errors.slug && <div style={errorStyle}>{errors.slug}</div>}
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Rol</label>
          <select
            className="admin-input"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <option value="dj">DJ</option>
            <option value="live">Live</option>
            <option value="resident">Residente</option>
            <option value="guest">Invitado</option>
          </select>
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Bio</label>
        <textarea
          className="admin-input"
          rows={3}
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Biografía del artista..."
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="admin-grid-2">
        <div style={fieldWrap}>
          <label style={labelStyle}>Géneros (separar con coma)</label>
          <input
            className="admin-input"
            value={form.genres}
            onChange={(e) => handleChange("genres", e.target.value)}
            placeholder="Techno, Industrial"
          />
        </div>
        <div className="admin-grid-2">
          <div style={fieldWrap}>
            <label style={labelStyle}>Orden</label>
            <input
              className="admin-input"
              type="number"
              value={form.sort_order}
              onChange={(e) => handleChange("sort_order", e.target.value)}
              min={0}
            />
          </div>
          <div
            style={{
              ...fieldWrap,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              paddingTop: "1.5rem",
            }}
          >
            <input
              type="checkbox"
              id="is_visible"
              checked={form.is_visible}
              onChange={(e) => handleChange("is_visible", e.target.checked)}
              style={{ accentColor: "#fff" }}
            />
            <label
              htmlFor="is_visible"
              style={{ fontSize: "0.8125rem", color: "#aaa" }}
            >
              Visible
            </label>
          </div>
        </div>
      </div>

      {/* Photo upload */}
      <div style={{ ...fieldWrap, maxWidth: "300px" }}>
        <label style={labelStyle}>Foto</label>
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
          }}
          onClick={() => document.getElementById("photo-input")?.click()}
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Photo preview"
              style={{
                maxHeight: "200px",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <span style={{ color: "#555", fontSize: "0.8125rem" }}>
              Click para subir foto
            </span>
          )}
        </div>
        <input
          id="photo-input"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file) {
              setPhotoFile(file);
              setPhotoPreview(URL.createObjectURL(file));
            }
          }}
        />
      </div>

      {/* Social Links */}
      <h3
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "1rem",
          marginTop: "0.5rem",
        }}
      >
        Links
      </h3>
      <div className="admin-grid-2">
        {[
          { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
          { key: "soundcloud_url", label: "SoundCloud", placeholder: "https://soundcloud.com/..." },
          { key: "ra_url", label: "Resident Advisor", placeholder: "https://ra.co/..." },
          { key: "bandcamp_url", label: "Bandcamp", placeholder: "https://....bandcamp.com" },
          { key: "website_url", label: "Website", placeholder: "https://..." },
        ].map((field) => (
          <div key={field.key} style={fieldWrap}>
            <label style={labelStyle}>{field.label}</label>
            <input
              className="admin-input"
              value={form[field.key as keyof typeof form] as string}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
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
            ? "Actualizar artista"
            : "Crear artista"}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => router.push("/admin/artistas")}
        >
          Cancelar
        </button>
        {isEditing && (
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={handleDelete}
            disabled={submitting}
            style={{ marginLeft: "auto" }}
          >
            Eliminar artista
          </button>
        )}
      </div>
    </form>
  );
}
