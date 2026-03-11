import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getTicketTypes } from "@/lib/data";
import { CheckoutForm } from "./checkout-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado" };
  return { title: `Comprar entradas — ${event.name}` };
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  if (event.is_past) {
    return (
      <section style={{ padding: "48px 64px 96px", maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, textTransform: "uppercase", marginBottom: "24px" }}>
          Evento pasado
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>
          Las entradas para este evento ya no están disponibles.
        </p>
      </section>
    );
  }

  const tickets = await getTicketTypes(event.id);
  const activeTickets = tickets.filter(t => t.is_active && (t.stock === 0 || t.sold < t.stock));

  if (activeTickets.length === 0) {
    return (
      <section style={{ padding: "48px 64px 96px", maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, textTransform: "uppercase", marginBottom: "24px" }}>
          Sin entradas disponibles
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>
          No hay entradas disponibles para este evento en este momento.
        </p>
      </section>
    );
  }

  return (
    <section style={{ padding: "48px 64px 96px", maxWidth: "700px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <p
          style={{
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.3)",
            marginBottom: "16px",
          }}
        >
          Comprar entradas
        </p>
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {event.name}
        </h1>
      </div>

      <CheckoutForm
        event={{ id: event.id, slug: event.slug, name: event.name }}
        tickets={activeTickets.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          price: t.price,
          stock: t.stock,
          sold: t.sold,
          max_per_order: t.max_per_order,
        }))}
      />
    </section>
  );
}
