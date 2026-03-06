import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";
import { LineupManager } from "@/components/admin/lineup-manager";
import { TicketManager } from "@/components/admin/ticket-manager";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) notFound();

  /* Lineup entries */
  const { data: lineup } = await supabase
    .from("event_artists")
    .select(
      "id, set_time, set_end, set_type, is_headliner, sort_order, artist:artists(id, name, slug)"
    )
    .eq("event_id", id)
    .order("sort_order");

  /* Available artists */
  const { data: allArtists } = await supabase
    .from("artists")
    .select("id, name, slug")
    .order("name");

  /* Ticket types */
  const { data: tickets } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", id)
    .order("sort_order");

  const lineupData = (lineup ?? []).map((l) => ({
    ...l,
    artist: Array.isArray(l.artist) ? l.artist[0] : l.artist,
  }));

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/eventos"
          style={{
            fontSize: "0.75rem",
            color: "#666",
            textDecoration: "underline",
          }}
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
          Editar: {event.name}
        </h1>
      </div>

      {/* Event Form */}
      <div
        style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <EventForm initialData={event} />
      </div>

      {/* Lineup Manager */}
      <div
        style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <LineupManager
          eventId={id}
          lineup={lineupData}
          allArtists={allArtists ?? []}
        />
      </div>

      {/* Ticket Types Manager */}
      <div
        style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: "0.5rem",
          padding: "1.5rem",
        }}
      >
        <TicketManager eventId={id} tickets={tickets ?? []} />
      </div>
    </div>
  );
}
