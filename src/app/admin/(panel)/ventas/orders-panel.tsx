"use client";

import { useState } from "react";
import type { ActionResult } from "@/lib/admin-actions";

interface Order {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  status: string;
  total: number;
  mp_payment_id: string | null;
  created_at: string;
  event?: { name: string; slug: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
  refunded: "#8b5cf6",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
  refunded: "Reembolsada",
};

export function OrdersPanel({
  orders,
  updateOrderStatus,
}: {
  orders: Order[];
  updateOrderStatus: (id: string, status: string) => Promise<ActionResult>;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const stats = {
    total: orders.length,
    approved: orders.filter(o => o.status === "approved").length,
    pending: orders.filter(o => o.status === "pending").length,
    revenue: orders.filter(o => o.status === "approved").reduce((s, o) => s + o.total, 0),
  };

  async function handleStatusChange(orderId: string, newStatus: string) {
    setLoading(orderId);
    await updateOrderStatus(orderId, newStatus);
    setLoading(null);
    window.location.reload();
  }

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
        {[
          { label: "Total órdenes", value: stats.total },
          { label: "Aprobadas", value: stats.approved },
          { label: "Pendientes", value: stats.pending },
          { label: "Ingresos", value: `$${stats.revenue.toLocaleString("es-CL")}` },
        ].map(s => (
          <div
            key={s.label}
            style={{
              flex: 1,
              padding: "20px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>
              {s.label}
            </p>
            <p style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["all", "pending", "approved", "rejected", "refunded"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              border: "1px solid",
              borderColor: filter === f ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
              background: filter === f ? "rgba(255,255,255,0.08)" : "transparent",
              color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
              cursor: "pointer",
            }}
          >
            {f === "all" ? "Todas" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {filtered.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)", padding: "40px 0", textAlign: "center" }}>
          No hay órdenes
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {["Fecha", "Comprador", "Evento", "Total", "Estado", "Acciones"].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "left",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                    {new Date(order.created_at).toLocaleDateString("es-CL")}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>{order.name}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{order.email}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                    {order.event?.name ?? "—"}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 600 }}>
                    ${order.total.toLocaleString("es-CL")}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: STATUS_COLORS[order.status] || "#fff",
                        border: `1px solid ${STATUS_COLORS[order.status] || "rgba(255,255,255,0.2)"}40`,
                        background: `${STATUS_COLORS[order.status] || "rgba(255,255,255,0.1)"}15`,
                      }}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "approved")}
                        disabled={loading === order.id}
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          background: "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          color: "#22c55e",
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                      >
                        Aprobar
                      </button>
                    )}
                    {order.status === "approved" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "refunded")}
                        disabled={loading === order.id}
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          background: "rgba(139,92,246,0.15)",
                          border: "1px solid rgba(139,92,246,0.3)",
                          color: "#8b5cf6",
                          cursor: "pointer",
                        }}
                      >
                        Reembolsar
                      </button>
                    )}
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
