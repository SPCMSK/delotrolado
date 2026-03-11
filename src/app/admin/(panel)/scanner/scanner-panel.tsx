"use client";

import { useState } from "react";
import { validateTicketQR, markTicketUsed } from "@/lib/admin-actions";

interface TicketInfo {
  id: string;
  qr_code: string;
  is_used: boolean;
  used_at: string | null;
  order_name: string;
  order_email: string;
  event_name: string;
  ticket_type_name: string;
}

export function ScannerPanel() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error" | "warning"; ticket?: TicketInfo; message: string } | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    const res = await validateTicketQR(code.trim());

    if ("error" in res) {
      setResult({ type: "error", message: res.error });
    } else if (res.ticket.is_used) {
      setResult({
        type: "warning",
        ticket: res.ticket,
        message: `Entrada ya utilizada el ${new Date(res.ticket.used_at!).toLocaleString("es-CL")}`,
      });
    } else {
      setResult({
        type: "success",
        ticket: res.ticket,
        message: "Entrada válida",
      });
    }

    setLoading(false);
  }

  async function handleMarkUsed() {
    if (!result?.ticket) return;
    setLoading(true);
    const res = await markTicketUsed(result.ticket.id);
    if ("error" in res) {
      setResult({ type: "error", message: res.error });
    } else {
      setResult({
        type: "success",
        ticket: { ...result.ticket, is_used: true, used_at: new Date().toISOString() },
        message: "✓ Entrada marcada como utilizada",
      });
    }
    setLoading(false);
    setCode("");
  }

  const bgColor =
    result?.type === "success" ? "rgba(34,197,94,0.08)" :
    result?.type === "warning" ? "rgba(245,158,11,0.08)" :
    result?.type === "error" ? "rgba(239,68,68,0.08)" : "transparent";

  const borderColor =
    result?.type === "success" ? "rgba(34,197,94,0.3)" :
    result?.type === "warning" ? "rgba(245,158,11,0.3)" :
    result?.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)";

  const textColor =
    result?.type === "success" ? "#22c55e" :
    result?.type === "warning" ? "#f59e0b" :
    result?.type === "error" ? "#ef4444" : "#fff";

  return (
    <div style={{ maxWidth: "500px" }}>
      {/* Input form */}
      <form onSubmit={handleScan} style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        <input
          type="text"
          placeholder="Ingresá el código QR (ej: DOL-A1B2C3D4-...)"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          autoFocus
          style={{
            flex: 1,
            padding: "14px 16px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "16px",
            fontFamily: "var(--font-mono), monospace",
            letterSpacing: "0.08em",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          style={{
            padding: "14px 24px",
            background: "#fff",
            color: "#000",
            border: "none",
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          Validar
        </button>
      </form>

      {/* Result */}
      {result && (
        <div
          style={{
            padding: "32px",
            background: bgColor,
            border: `1px solid ${borderColor}`,
          }}
        >
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: textColor,
              marginBottom: "20px",
            }}
          >
            {result.message}
          </p>

          {result.ticket && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Código</span>
                <span style={{ fontSize: "13px", fontFamily: "var(--font-mono), monospace" }}>{result.ticket.qr_code}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Nombre</span>
                <span style={{ fontSize: "13px" }}>{result.ticket.order_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Email</span>
                <span style={{ fontSize: "13px" }}>{result.ticket.order_email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Evento</span>
                <span style={{ fontSize: "13px" }}>{result.ticket.event_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Tipo</span>
                <span style={{ fontSize: "13px" }}>{result.ticket.ticket_type_name}</span>
              </div>

              {/* Mark as used button */}
              {result.type === "success" && !result.ticket.is_used && (
                <button
                  onClick={handleMarkUsed}
                  disabled={loading}
                  style={{
                    marginTop: "16px",
                    padding: "14px",
                    background: "rgba(34,197,94,0.2)",
                    border: "1px solid rgba(34,197,94,0.4)",
                    color: "#22c55e",
                    fontSize: "14px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  ✓ Marcar como utilizada
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
