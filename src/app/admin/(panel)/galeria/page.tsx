"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import {
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "@/lib/admin-actions";
import { uploadImage } from "@/lib/storage";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  photographer: string | null;
  event_id: string | null;
  is_visible: boolean;
  sort_order: number;
}

interface EventOption {
  id: string;
  name: string;
}

export default function AdminGaleriaPage() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* Upload form state */
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadEvent, setUploadEvent] = useState("");
  const [uploadPhotographer, setUploadPhotographer] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const supabase = createSupabaseBrowser();

    const [imagesRes, eventsRes] = await Promise.all([
      supabase
        .from("gallery_images")
        .select("id, url, alt, caption, photographer, event_id, is_visible, sort_order")
        .order("sort_order"),
      supabase.from("events").select("id, name").order("date", { ascending: false }),
    ]);

    setImages(imagesRes.data ?? []);
    setEvents(eventsRes.data ?? []);
    setLoading(false);
  }

  async function handleUpload() {
    if (pendingFiles.length === 0) {
      setError("Selecciona al menos una imagen");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    let successCount = 0;
    let failCount = 0;

    for (const file of pendingFiles) {
      try {
        const url = await uploadImage("gallery", file);
        const result = await createGalleryImage({
          url,
          event_id: uploadEvent || null,
          photographer: uploadPhotographer.trim() || null,
          alt: file.name.replace(/\.[^.]+$/, ""),
          is_visible: true,
          sort_order: images.length + successCount,
        });
        if ("error" in result) {
          failCount++;
        } else {
          successCount++;
        }
      } catch {
        failCount++;
      }
    }

    setPendingFiles([]);
    setUploading(false);

    if (failCount > 0) {
      setError(`${failCount} imagen(es) fallaron al subir`);
    }
    if (successCount > 0) {
      setMessage(`${successCount} imagen(es) subidas correctamente`);
    }

    loadData();
    router.refresh();
  }

  async function toggleVisibility(img: GalleryImage) {
    await updateGalleryImage(img.id, { is_visible: !img.is_visible });
    setImages((prev) =>
      prev.map((i) =>
        i.id === img.id ? { ...i, is_visible: !i.is_visible } : i
      )
    );
    router.refresh();
  }

  async function handleDelete(img: GalleryImage) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    const result = await deleteGalleryImage(img.id);
    if ("error" in result) {
      alert(result.error);
    } else {
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      router.refresh();
    }
  }

  if (loading) {
    return <div style={{ color: "#666" }}>Cargando galería…</div>;
  }

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
        Galería
      </h1>
      <p
        style={{ fontSize: "0.8125rem", color: "#666", marginBottom: "2rem" }}
      >
        {images.length} imagen{images.length !== 1 ? "es" : ""}
      </p>

      {/* Upload section */}
      <div
        style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#fff",
            marginBottom: "1rem",
          }}
        >
          Subir imágenes
        </h2>

        {error && (
          <div
            style={{
              padding: "0.625rem 0.75rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.375rem",
              color: "#ef4444",
              fontSize: "0.8125rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            style={{
              padding: "0.625rem 0.75rem",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "0.375rem",
              color: "#22c55e",
              fontSize: "0.8125rem",
              marginBottom: "1rem",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#888",
                marginBottom: "0.375rem",
                textTransform: "uppercase",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              Imágenes
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setPendingFiles(Array.from(e.target.files ?? []))
              }
              className="admin-input"
              style={{ padding: "0.5rem" }}
            />
            {pendingFiles.length > 0 && (
              <div style={{ fontSize: "0.6875rem", color: "#666", marginTop: "0.25rem" }}>
                {pendingFiles.length} archivo{pendingFiles.length !== 1 ? "s" : ""} seleccionado{pendingFiles.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#888",
                marginBottom: "0.375rem",
                textTransform: "uppercase",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              Evento (opcional)
            </label>
            <select
              className="admin-input"
              value={uploadEvent}
              onChange={(e) => setUploadEvent(e.target.value)}
            >
              <option value="">— Sin evento —</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#888",
                marginBottom: "0.375rem",
                textTransform: "uppercase",
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              Fotógrafo
            </label>
            <input
              className="admin-input"
              value={uploadPhotographer}
              onChange={(e) => setUploadPhotographer(e.target.value)}
              placeholder="Nombre del fotógrafo"
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || pendingFiles.length === 0}
          className="admin-btn admin-btn-primary"
        >
          {uploading ? "Subiendo…" : "Subir imágenes"}
        </button>
      </div>

      {/* Image grid */}
      {images.length === 0 ? (
        <p style={{ color: "#555", textAlign: "center", padding: "3rem" }}>
          No hay imágenes en la galería.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                background: "#111",
                border: "1px solid #1a1a1a",
                borderRadius: "0.5rem",
                overflow: "hidden",
                opacity: img.is_visible ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  aspectRatio: "1/1",
                  background: "#0a0a0a",
                  position: "relative",
                }}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ padding: "0.75rem" }}>
                {img.photographer && (
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      color: "#888",
                      marginBottom: "0.25rem",
                    }}
                  >
                    📷 {img.photographer}
                  </div>
                )}
                {img.caption && (
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      color: "#666",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {img.caption}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => toggleVisibility(img)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: "0.25rem",
                    }}
                    title={img.is_visible ? "Ocultar" : "Mostrar"}
                  >
                    {img.is_visible ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      padding: "0.25rem",
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
