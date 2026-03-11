import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/data";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string; pending?: string; dev?: string }>;
}

export const metadata: Metadata = {
  title: "Confirmación de compra",
};

export default async function ConfirmacionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { order: orderId, pending, dev } = await searchParams;

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  let order = null;

  if (orderId) {
    const { data } = await supabase
      .from("orders")
      .select("id, email, name, status, total, created_at")
      .eq("id", orderId)
      .single();
    order = data;
  }

  const isApproved = order?.status === "approved";
  const isPending = pending === "1" || order?.status === "pending";
  const isDev = dev === "1";

  return (
    <section style={{ padding: "48px 64px 96px", maxWidth: "700px", margin: "0 auto" }}>
      {/* Status icon */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: `2px solid ${isApproved || isDev ? "rgba(100,255,100,0.4)" : isPending ? "rgba(255,200,50,0.4)" : "rgba(255,60,60,0.4)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "36px",
          }}
        >
          {isApproved || isDev ? "✓" : isPending ? "⏳" : "✕"}
        </div>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          {isApproved || isDev
            ? "¡Compra confirmada!"
            : isPending
              ? "Pago pendiente"
              : "Compra procesada"}
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
          {isApproved || isDev
            ? "Enviamos tus entradas con los códigos QR a tu correo electrónico. Revisá tu bandeja de entrada (y spam)."
            : isPending
              ? "Tu pago está siendo procesado. Recibirás un email con tus entradas cuando se apruebe."
              : "Se generó una orden para tu compra."}
        </p>
        {isDev && (
          <p style={{ fontSize: "12px", color: "rgba(255,200,50,0.6)", marginTop: "12px" }}>
            ⚠ Modo desarrollo — MercadoPago no está configurado
          </p>
        )}
      </div>

      {/* Order details */}
      {order && (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "32px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.25)",
              marginBottom: "24px",
            }}
          >
            Detalle de la orden
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Evento</span>
              <span style={{ fontSize: "14px" }}>{event.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Nombre</span>
              <span style={{ fontSize: "14px" }}>{order.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Email</span>
              <span style={{ fontSize: "14px" }}>{order.email}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "12px",
                marginTop: "8px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: "18px", fontWeight: 700 }}>
                ${order.total.toLocaleString("es-CL")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Email confirmation notice */}
      {(isApproved || isDev) && order && (
        <div
          style={{
            border: "1px solid rgba(100,255,100,0.15)",
            background: "rgba(100,255,100,0.03)",
            padding: "24px 32px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "28px" }}>📧</span>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>
              Entradas enviadas a <strong>{order.email}</strong>
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              El email incluye los códigos QR de cada entrada y la info del evento.
              Si no lo encontrás, revisá tu carpeta de spam.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        <Link
          href={`/eventos/${slug}`}
          style={{
            padding: "14px 32px",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            textDecoration: "none",
          }}
        >
          Ver evento
        </Link>
        <Link
          href="/eventos"
          style={{
            padding: "14px 32px",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            textDecoration: "none",
          }}
        >
          Todos los eventos
        </Link>
      </div>
    </section>
  );
}
