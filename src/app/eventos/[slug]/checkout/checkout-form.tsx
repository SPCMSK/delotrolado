"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/data";

interface TicketOption {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sold: number;
  max_per_order: number;
}

interface Props {
  event: { id: string; slug: string; name: string };
  tickets: TicketOption[];
}

export function CheckoutForm({ event, tickets }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buyer, setBuyer] = useState({ name: "", email: "", emailConfirm: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = tickets.reduce((sum, t) => sum + (quantities[t.id] || 0) * t.price, 0);
  const hasItems = Object.values(quantities).some(q => q > 0);

  function updateQty(ticketId: string, delta: number) {
    setQuantities(prev => {
      const ticket = tickets.find(t => t.id === ticketId)!;
      const current = prev[ticketId] || 0;
      const available = ticket.stock > 0 ? ticket.stock - ticket.sold : ticket.max_per_order;
      const max = Math.min(ticket.max_per_order, available);
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [ticketId]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasItems) {
      setError("Seleccioná al menos una entrada");
      return;
    }
    if (buyer.email !== buyer.emailConfirm) {
      setError("Los emails no coinciden");
      return;
    }

    setLoading(true);
    try {
      const items = Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([ticket_type_id, quantity]) => ({ ticket_type_id, quantity }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          event_slug: event.slug,
          items,
          buyer: {
            name: buyer.name,
            email: buyer.email,
            phone: buyer.phone || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al procesar la compra");
        return;
      }

      if (data.init_point) {
        // Redirect to MercadoPago
        window.location.href = data.init_point;
      } else if (data.mp_not_configured) {
        // Dev mode — MP not configured, go to confirmation directly
        window.location.href = `/eventos/${event.slug}/confirmacion?order=${data.order_id}&dev=1`;
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
      {/* Ticket selection */}
      <div>
        <h2
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "rgba(255,255,255,0.25)",
            marginBottom: "24px",
          }}
        >
          Seleccionar entradas
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tickets.map(ticket => {
            const qty = quantities[ticket.id] || 0;
            const available = ticket.stock > 0 ? ticket.stock - ticket.sold : null;
            return (
              <div
                key={ticket.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "24px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: qty > 0 ? "rgba(255,255,255,0.03)" : "transparent",
                }}
              >
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                    {ticket.name}
                  </p>
                  {ticket.description && (
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
                      {ticket.description}
                    </p>
                  )}
                  <p style={{ fontSize: "18px", fontWeight: 700, marginTop: "8px" }}>
                    {formatPrice(ticket.price)}
                  </p>
                  {available !== null && (
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "4px" }}>
                      {available} disponibles
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => updateQty(ticket.id, -1)}
                    disabled={qty === 0}
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: qty === 0 ? "rgba(255,255,255,0.15)" : "#fff",
                      fontSize: "18px",
                      cursor: qty === 0 ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      minWidth: "24px",
                      textAlign: "center",
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(ticket.id, 1)}
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "#fff",
                      fontSize: "18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buyer info */}
      {hasItems && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Tus datos
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="text"
              placeholder="Nombre completo"
              required
              value={buyer.name}
              onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
              }}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={buyer.email}
              onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
              }}
            />
            <input
              type="email"
              placeholder="Confirmar email"
              required
              value={buyer.emailConfirm}
              onChange={e => setBuyer(b => ({ ...b, emailConfirm: e.target.value }))}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
              }}
            />
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={buyer.phone}
              onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>
        </div>
      )}

      {/* Total + Submit */}
      {hasItems && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
              Total
            </span>
            <span style={{ fontSize: "28px", fontWeight: 700 }}>
              {formatPrice(total)}
            </span>
          </div>

          {error && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(255,60,60,0.1)",
                border: "1px solid rgba(255,60,60,0.3)",
                color: "#ff6b6b",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "18px",
              backgroundColor: loading ? "rgba(255,255,255,0.5)" : "#fff",
              color: "#000",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Procesando..." : "Pagar con MercadoPago"}
          </button>

          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.6 }}>
            Serás redirigido a MercadoPago para completar el pago.
            <br />
            Recibirás tu entrada con código QR por email.
          </p>
        </div>
      )}
    </form>
  );
}
