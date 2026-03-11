"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import {
  createPageContent,
  updatePageContent,
  deletePageContent,
} from "@/lib/admin-actions";
import { Eye, EyeOff, Trash2, Plus, Save } from "lucide-react";

interface ContentBlock {
  id: string;
  page_slug: string;
  section_key: string;
  title: string | null;
  body: string | null;
  sort_order: number;
  is_visible: boolean;
}

const PAGE_OPTIONS = [
  { slug: "info", label: "Info" },
  { slug: "privacidad", label: "Privacidad" },
  { slug: "terminos", label: "Términos" },
];

export default function AdminContenidoPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("info");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* Editing state */
  const [editedBlocks, setEditedBlocks] = useState<
    Record<string, Partial<ContentBlock>>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  /* New block form */
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    section_key: "",
    title: "",
    body: "",
    sort_order: "0",
  });

  useEffect(() => {
    loadBlocks();
  }, []);

  async function loadBlocks() {
    const supabase = createSupabaseBrowser();
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .order("page_slug")
      .order("sort_order");

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setBlocks(data ?? []);
    }
    setLoading(false);
  }

  const filteredBlocks = blocks.filter((b) => b.page_slug === activePage);

  function handleEdit(id: string, field: string, value: string | boolean) {
    setEditedBlocks((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    setMessage(null);
  }

  function getFieldValue(block: ContentBlock, field: keyof ContentBlock) {
    const edited = editedBlocks[block.id];
    if (edited && field in edited) return edited[field as keyof typeof edited];
    return block[field];
  }

  async function handleSave(block: ContentBlock) {
    const edited = editedBlocks[block.id];
    if (!edited) return;

    setSavingId(block.id);
    setMessage(null);

    const result = await updatePageContent(block.id, {
      ...edited,
      page_slug: block.page_slug,
    });

    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Bloque actualizado" });
      /* Update local state */
      setBlocks((prev) =>
        prev.map((b) => (b.id === block.id ? { ...b, ...edited } : b))
      );
      setEditedBlocks((prev) => {
        const next = { ...prev };
        delete next[block.id];
        return next;
      });
    }
    setSavingId(null);
  }

  async function handleToggleVisible(block: ContentBlock) {
    const newVal = !block.is_visible;
    const result = await updatePageContent(block.id, {
      is_visible: newVal,
      page_slug: block.page_slug,
    });
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
    } else {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id ? { ...b, is_visible: newVal } : b
        )
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este bloque de contenido?")) return;
    const result = await deletePageContent(id);
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
    } else {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      setMessage({ type: "success", text: "Bloque eliminado" });
    }
  }

  async function handleCreate() {
    if (!newBlock.section_key.trim()) {
      setMessage({ type: "error", text: "La clave de sección es requerida" });
      return;
    }

    setSavingId("new");
    setMessage(null);

    const result = await createPageContent({
      page_slug: activePage,
      section_key: newBlock.section_key.trim(),
      title: newBlock.title.trim() || null,
      body: newBlock.body.trim() || null,
      sort_order: parseInt(newBlock.sort_order) || 0,
      is_visible: true,
    });

    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Bloque creado" });
      setNewBlock({ section_key: "", title: "", body: "", sort_order: "0" });
      setShowNewForm(false);
      loadBlocks();
    }
    setSavingId(null);
  }

  if (loading) return <div style={{ color: "#666" }}>Cargando…</div>;

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.625rem",
    fontWeight: 500,
    color: "#666",
    marginBottom: "0.25rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

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
        Contenido de Páginas
      </h1>
      <p
        style={{ fontSize: "0.8125rem", color: "#666", marginBottom: "2rem" }}
      >
        Edita los textos de las páginas Info, Privacidad y Términos
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

      {/* Page tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid #1a1a1a",
          paddingBottom: "0.5rem",
        }}
      >
        {PAGE_OPTIONS.map((page) => {
          const count = blocks.filter(
            (b) => b.page_slug === page.slug
          ).length;
          const isActive = activePage === page.slug;
          return (
            <button
              key={page.slug}
              onClick={() => {
                setActivePage(page.slug);
                setMessage(null);
              }}
              style={{
                padding: "0.5rem 1rem",
                background: isActive ? "#1a1a1a" : "transparent",
                border: "none",
                borderRadius: "0.375rem 0.375rem 0 0",
                color: isActive ? "#fff" : "#666",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {page.label}{" "}
              <span style={{ fontSize: "0.6875rem", color: "#555" }}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Blocks */}
      {filteredBlocks.length === 0 ? (
        <p style={{ color: "#555", marginBottom: "1.5rem" }}>
          No hay bloques de contenido para esta página.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          {filteredBlocks.map((block) => {
            const hasEdits = !!editedBlocks[block.id];
            return (
              <div
                key={block.id}
                style={{
                  background: "#111",
                  border: `1px solid ${hasEdits ? "#333" : "#1a1a1a"}`,
                  borderRadius: "0.5rem",
                  padding: "1.25rem",
                  opacity: block.is_visible ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: "#555",
                      fontFamily: "var(--font-main)",
                      background: "#0a0a0a",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "0.25rem",
                    }}
                  >
                    {block.section_key}
                  </span>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: "#444",
                    }}
                  >
                    orden: {block.sort_order}
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                    {hasEdits && (
                      <button
                        onClick={() => handleSave(block)}
                        disabled={savingId === block.id}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#22c55e",
                          cursor: "pointer",
                          padding: "0.25rem",
                        }}
                        title="Guardar cambios"
                      >
                        <Save size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleVisible(block)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        padding: "0.25rem",
                      }}
                      title={block.is_visible ? "Ocultar" : "Mostrar"}
                    >
                      {block.is_visible ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(block.id)}
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

                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={labelStyle}>Título</label>
                  <input
                    className="admin-input"
                    value={
                      (getFieldValue(block, "title") as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEdit(block.id, "title", e.target.value)
                    }
                    placeholder="Título (opcional)"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contenido</label>
                  <textarea
                    className="admin-input"
                    rows={3}
                    value={
                      (getFieldValue(block, "body") as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEdit(block.id, "body", e.target.value)
                    }
                    placeholder="Texto del bloque..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new block */}
      {showNewForm ? (
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "0.5rem",
            padding: "1.25rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "1rem",
            }}
          >
            Nuevo bloque de contenido
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <label style={labelStyle}>Clave de sección *</label>
              <input
                className="admin-input"
                value={newBlock.section_key}
                onChange={(e) =>
                  setNewBlock((p) => ({
                    ...p,
                    section_key: e.target.value,
                  }))
                }
                placeholder="section_7"
              />
            </div>
            <div>
              <label style={labelStyle}>Orden</label>
              <input
                className="admin-input"
                type="number"
                value={newBlock.sort_order}
                onChange={(e) =>
                  setNewBlock((p) => ({
                    ...p,
                    sort_order: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>Título</label>
            <input
              className="admin-input"
              value={newBlock.title}
              onChange={(e) =>
                setNewBlock((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Título del bloque"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Contenido</label>
            <textarea
              className="admin-input"
              rows={3}
              value={newBlock.body}
              onChange={(e) =>
                setNewBlock((p) => ({ ...p, body: e.target.value }))
              }
              placeholder="Texto del bloque..."
              style={{ resize: "vertical" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleCreate}
              disabled={savingId === "new"}
              className="admin-btn admin-btn-primary"
              style={{ fontSize: "0.8125rem" }}
            >
              {savingId === "new" ? "Creando…" : "Crear bloque"}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: "0.8125rem" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setNewBlock({
              section_key: "",
              title: "",
              body: "",
              sort_order: String(filteredBlocks.length),
            });
            setShowNewForm(true);
          }}
          className="admin-btn admin-btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Plus size={14} />
          Agregar bloque
        </button>
      )}
    </div>
  );
}
