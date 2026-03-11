import { createSupabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EventDeleteButton } from "@/components/admin/event-delete-button";

export default async function AdminEventosPage() {
  const supabase = await createSupabaseServer();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, slug, name, date, venue, city, status, is_featured, is_past")
    .order("date", { ascending: false });

  if (error) {
    return (
      <div style={{ color: "#ef4444" }}>
        Error al cargar eventos: {error.message}
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    published: "#22c55e",
    draft: "#eab308",
    cancelled: "#ef4444",
  };

  const STATUS_LABELS: Record<string, string> = {
    published: "Publicado",
    draft: "Borrador",
    cancelled: "Cancelado",
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
            Eventos
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "#666", marginTop: "0.25rem" }}>
            {events?.length ?? 0} evento{(events?.length ?? 0) !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="admin-btn admin-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <Plus size={16} />
          Nuevo evento
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "#666",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>No hay eventos creados.</p>
          <Link href="/admin/eventos/nuevo" style={{ color: "#fff", textDecoration: "underline" }}>
            Crear el primer evento →
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
                {["Nombre", "Fecha", "Venue", "Estado", "Temporal.", "Acciones"].map(
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
              {events.map((event) => (
                <tr
                  key={event.id}
                  style={{ borderBottom: "1px solid #111" }}
                >
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ color: "#fff", fontWeight: 500 }}>
                      {event.name}
                      {event.is_featured && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.625rem",
                            color: "#eab308",
                          }}
                        >
                          ★
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "#555",
                        fontFamily: "var(--font-main)",
                      }}
                    >
                      /{event.slug}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#aaa" }}>
                    {event.date}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#aaa" }}>
                    {event.venue}, {event.city}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "9999px",
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        background: `${STATUS_COLORS[event.status]}15`,
                        color: STATUS_COLORS[event.status],
                        border: `1px solid ${STATUS_COLORS[event.status]}30`,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: STATUS_COLORS[event.status],
                        }}
                      />
                      {STATUS_LABELS[event.status] ?? event.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        padding: "0.25rem 0.625rem",
                        borderRadius: "9999px",
                        background: event.is_past
                          ? "rgba(156,163,175,0.1)"
                          : "rgba(59,130,246,0.1)",
                        color: event.is_past ? "#9ca3af" : "#3b82f6",
                        border: `1px solid ${event.is_past ? "rgba(156,163,175,0.3)" : "rgba(59,130,246,0.3)"}`,
                      }}
                    >
                      {event.is_past ? "Pasado" : "Vigente"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        href={`/admin/eventos/${event.id}`}
                        style={{
                          color: "#888",
                          textDecoration: "underline",
                          fontSize: "0.75rem",
                        }}
                      >
                        Editar
                      </Link>
                      <EventDeleteButton id={event.id} name={event.name} />
                    </div>
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
