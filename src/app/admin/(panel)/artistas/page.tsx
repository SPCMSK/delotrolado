import { createSupabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminArtistasPage() {
  const supabase = await createSupabaseServer();
  const { data: artists, error } = await supabase
    .from("artists")
    .select("id, slug, name, role, is_visible, genres, sort_order")
    .order("sort_order")
    .order("name");

  if (error) {
    return (
      <div style={{ color: "#ef4444" }}>
        Error al cargar artistas: {error.message}
      </div>
    );
  }

  const ROLE_LABELS: Record<string, string> = {
    resident: "Residente",
    dj: "DJ",
    live: "Live",
    guest: "Invitado",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Artistas
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "#666", marginTop: "0.25rem" }}>
            {artists?.length ?? 0} artista{(artists?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/artistas/nuevo"
          className="admin-btn admin-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <Plus size={16} />
          Nuevo artista
        </Link>
      </div>

      {!artists || artists.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "4rem 2rem", color: "#666" }}
        >
          <p style={{ marginBottom: "1rem" }}>No hay artistas.</p>
          <Link
            href="/admin/artistas/nuevo"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Crear el primer artista →
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: "#111",
            border: "1px solid #1a1a1a",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.8125rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                {["#", "Nombre", "Rol", "Géneros", "Visible", "Acciones"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 1rem",
                        color: "#666",
                        fontWeight: 500,
                        fontSize: "0.6875rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr
                  key={artist.id}
                  style={{ borderBottom: "1px solid #111" }}
                >
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      color: "#555",
                      fontSize: "0.6875rem",
                    }}
                  >
                    {artist.sort_order}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      {artist.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "#555",
                        fontFamily: "var(--font-geist-mono)",
                      }}
                    >
                      /{artist.slug}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#aaa" }}>
                    {ROLE_LABELS[artist.role] ?? artist.role}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      {(artist.genres ?? []).map((g: string) => (
                        <span
                          key={g}
                          style={{
                            fontSize: "0.625rem",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "9999px",
                            border: "1px solid #333",
                            color: "#888",
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        color: artist.is_visible ? "#22c55e" : "#666",
                        fontSize: "0.75rem",
                      }}
                    >
                      {artist.is_visible ? "Sí" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <Link
                      href={`/admin/artistas/${artist.id}`}
                      style={{
                        color: "#888",
                        textDecoration: "underline",
                        fontSize: "0.75rem",
                      }}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
