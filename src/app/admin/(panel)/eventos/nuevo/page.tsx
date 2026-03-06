import { EventForm } from "@/components/admin/event-form";
import Link from "next/link";

export default function NuevoEventoPage() {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/eventos"
          style={{ fontSize: "0.75rem", color: "#666", textDecoration: "underline" }}
        >
          ← Volver a eventos
        </Link>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#fff",
            marginTop: "0.75rem",
          }}
        >
          Nuevo Evento
        </h1>
      </div>
      <div
        style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: "0.5rem",
          padding: "1.5rem",
        }}
      >
        <EventForm />
      </div>
    </div>
  );
}
