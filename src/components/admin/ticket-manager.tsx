"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "@/lib/admin-actions";

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sold: number;
  max_per_order: number;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  eventId: string;
  tickets: Ticket[];
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  max_per_order: "4",
  is_active: true,
  sort_order: "0",
};

export function TicketManager({ eventId, tickets }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function startAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: String(tickets.length) });
    setAdding(true);
    setError("");
  }

  function startEdit(t: Ticket) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      description: t.description ?? "",
      price: String(t.price),
      stock: String(t.stock),
      max_per_order: String(t.max_per_order),
      is_active: t.is_active,
      sort_order: String(t.sort_order),
    });
    setAdding(true);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    const price = parseInt(form.price);
    const stock = parseInt(form.stock);
    if (isNaN(price) || price < 0) {
      setError("Precio inválido");
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setError("Stock inválido");
      return;
    }

    setLoading(true);
    setError("");

    const data = {
      event_id: eventId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      stock,
      max_per_order: parseInt(form.max_per_order) || 4,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order) || 0,
    };

    const result = editingId
      ? await updateTicketType(editingId, data)
      : await createTicketType(data);

    if ("error" in result) {
      setError(result.error);
    } else {
      setAdding(false);
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar tipo "${name}"?`)) return;
    const result = await deleteTicketType(id);
    if ("error" in result) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  function fmtPrice(p: number) {
    return `$${p.toLocaleString("es-CL")}`;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
          Entradas ({tickets.length})
        </h2>
        {!adding && (
          <button
            onClick={startAdd}
            className="admin-btn admin-btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
          >
            + Agregar tipo
          </button>
        )}
      </div>

      {tickets.length === 0 && !adding ? (
        <p style={{ color: "#555", fontSize: "0.8125rem" }}>
          No hay tipos de entrada.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.8125rem",
            marginBottom: adding ? "1rem" : 0,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
              {["Nombre", "Precio", "Stock", "Vendidas", "Activo", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "0.5rem 0.75rem",
                      color: "#555",
                      fontWeight: 500,
                      fontSize: "0.625rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #0a0a0a" }}>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  <div style={{ color: "#fff", fontWeight: 500 }}>{t.name}</div>
                  {t.description && (
                    <div style={{ color: "#555", fontSize: "0.6875rem" }}>
                      {t.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#aaa" }}>
                  {fmtPrice(t.price)}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#aaa" }}>
                  {t.stock}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#aaa" }}>
                  {t.sold}
                </td>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  <span
                    style={{
                      color: t.is_active ? "#22c55e" : "#666",
                      fontSize: "0.75rem",
                    }}
                  >
                    {t.is_active ? "Sí" : "No"}
                  </span>
                </td>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => startEdit(t)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#888",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        textDecoration: "underline",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        textDecoration: "underline",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add/Edit form */}
      {adding && (
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid #222",
            borderRadius: "0.375rem",
            padding: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#fff",
              marginBottom: "0.75rem",
            }}
          >
            {editingId ? "Editar tipo de entrada" : "Nuevo tipo de entrada"}
          </h3>

          {error && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.625rem",
                  color: "#666",
                  display: "block",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase",
                }}
              >
                Nombre *
              </label>
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="General"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.625rem",
                  color: "#666",
                  display: "block",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase",
                }}
              >
                Precio (CLP)
              </label>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
                placeholder="8000"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "0.625rem",
                  color: "#666",
                  display: "block",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase",
                }}
              >
                Stock
              </label>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stock: e.target.value }))
                }
                placeholder="100"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: "0.5rem",
                paddingBottom: "0.375rem",
              }}
            >
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_active: e.target.checked }))
                }
                style={{ accentColor: "#fff" }}
              />
              <span style={{ fontSize: "0.75rem", color: "#888" }}>Activo</span>
            </div>
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                fontSize: "0.625rem",
                color: "#666",
                display: "block",
                marginBottom: "0.25rem",
                textTransform: "uppercase",
              }}
            >
              Descripción
            </label>
            <input
              className="admin-input"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Entrada general anticipada"
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleSave}
              disabled={loading}
              className="admin-btn admin-btn-primary"
              style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
            >
              {loading ? "Guardando…" : editingId ? "Actualizar" : "Crear"}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setEditingId(null);
                setError("");
              }}
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
