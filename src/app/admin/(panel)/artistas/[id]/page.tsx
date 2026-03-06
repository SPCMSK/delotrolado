import { createSupabaseServer } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArtistForm } from "@/components/admin/artist-form";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: artist, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !artist) notFound();

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/admin/artistas"
          style={{
            fontSize: "0.75rem",
            color: "#666",
            textDecoration: "underline",
          }}
        >
          ← Volver a artistas
        </Link>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#fff",
            marginTop: "0.75rem",
          }}
        >
          Editar: {artist.name}
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
        <ArtistForm initialData={artist} />
      </div>
    </div>
  );
}
