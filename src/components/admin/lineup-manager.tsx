"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToLineup, removeFromLineup } from "@/lib/admin-actions";

interface LineupEntry {
  id: string;
  set_time: string | null;
  set_end: string | null;
  set_type: string;
  is_headliner: boolean;
  sort_order: number;
  artist: { id: string; name: string; slug: string } | null;
}

interface Props {
  eventId: string;
  lineup: LineupEntry[];
  allArtists: { id: string; name: string; slug: string }[];
}

export function LineupManager({ eventId, lineup, allArtists }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newEntry, setNewEntry] = useState({
    artist_id: "",
    set_time: "",
    set_end: "",
    set_type: "DJ Set",
    is_headliner: false,
    sort_order: lineup.length,
  });

  /* Filter out artists already in lineup */
  const lineupArtistIds = new Set(lineup.map((l) => l.artist?.id).filter(Boolean));
  const availableArtists = allArtists.filter((a) => !lineupArtistIds.has(a.id));

  async function handleAdd() {
    if (!newEntry.artist_id) {
      setError("Selecciona un artista");
      return;
    }
    setLoading(true);
    setError("");

    const result = await addToLineup({
      event_id: eventId,
      artist_id: newEntry.artist_id,
      set_time: newEntry.set_time || null,
      set_end: newEntry.set_end || null,
      set_type: newEntry.set_type,
      is_headliner: newEntry.is_headliner,
      sort_order: newEntry.sort_order,
    });

    if ("error" in result) {
      setError(result.error);
    } else {
      setAdding(false);
      setNewEntry({
        artist_id: "",
        set_time: "",
        set_end: "",
        set_type: "DJ Set",
        is_headliner: false,
        sort_order: lineup.length + 1,
      });
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRemove(id: string) {
    if (!confirm("¿Eliminar del lineup?")) return;
    const result = await removeFromLineup(id);
    if ("error" in result) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : "—");

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
          Lineup ({lineup.length})
        </h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="admin-btn admin-btn-secondary"
            style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
          >
            + Agregar artista
          </button>
        )}
      </div>

      {lineup.length === 0 && !adding ? (
        <p style={{ color: "#555", fontSize: "0.8125rem" }}>
          No hay artistas en el lineup.
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
              {["#", "Artista", "Inicio", "Fin", "Tipo", "Headliner", ""].map(
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
            {lineup.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: "1px solid #0a0a0a" }}>
                <td style={{ padding: "0.5rem 0.75rem", color: "#555" }}>
                  {entry.sort_order}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#fff", fontWeight: 500 }}>
                  {entry.artist?.name ?? "—"}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#aaa" }}>
                  {fmtTime(entry.set_time)}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#aaa" }}>
                  {fmtTime(entry.set_end)}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#aaa" }}>
                  {entry.set_type}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#aaa" }}>
                  {entry.is_headliner ? "★" : "—"}
                </td>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  <button
                    onClick={() => handleRemove(entry.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      textDecoration: "underline",
                    }}
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add form */}
      {adding && (
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid #222",
            borderRadius: "0.375rem",
            padding: "1rem",
          }}
        >
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
              gridTemplateColumns: "2fr 1fr 1fr 1fr auto auto",
              gap: "0.75rem",
              alignItems: "end",
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
                Artista *
              </label>
              <select
                className="admin-input"
                value={newEntry.artist_id}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, artist_id: e.target.value }))
                }
              >
                <option value="">— Seleccionar —</option>
                {availableArtists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
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
                Inicio
              </label>
              <input
                className="admin-input"
                type="time"
                value={newEntry.set_time}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, set_time: e.target.value }))
                }
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
                Fin
              </label>
              <input
                className="admin-input"
                type="time"
                value={newEntry.set_end}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, set_end: e.target.value }))
                }
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
                Tipo
              </label>
              <select
                className="admin-input"
                value={newEntry.set_type}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, set_type: e.target.value }))
                }
              >
                <option value="DJ Set">DJ Set</option>
                <option value="Live">Live</option>
                <option value="B2B">B2B</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", paddingBottom: "0.375rem" }}>
              <input
                type="checkbox"
                checked={newEntry.is_headliner}
                onChange={(e) =>
                  setNewEntry((p) => ({ ...p, is_headliner: e.target.checked }))
                }
                style={{ accentColor: "#fff" }}
              />
              <span style={{ fontSize: "0.6875rem", color: "#888" }}>★</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", paddingBottom: "0.125rem" }}>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="admin-btn admin-btn-primary"
                style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
              >
                {loading ? "…" : "Agregar"}
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setError("");
                }}
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
