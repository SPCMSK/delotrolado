import { createSupabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  Image,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();

  /* ── Fetch stats in parallel ── */
  const [eventsRes, artistsRes, galleryRes, ordersRes] = await Promise.all([
    supabase.from("events").select("id, status, is_featured", { count: "exact" }),
    supabase.from("artists").select("id, is_visible", { count: "exact" }),
    supabase.from("gallery_images").select("id", { count: "exact" }),
    supabase.from("orders").select("id, status, total", { count: "exact" }),
  ]);

  const events = eventsRes.data ?? [];
  const artists = artistsRes.data ?? [];
  const gallery = galleryRes.data ?? [];
  const orders = ordersRes.data ?? [];

  const publishedEvents = events.filter((e) => e.status === "published").length;
  const draftEvents = events.filter((e) => e.status === "draft").length;
  const visibleArtists = artists.filter((a) => a.is_visible).length;
  const approvedOrders = orders.filter((o) => o.status === "approved");
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const stats = [
    {
      label: "Eventos publicados",
      value: publishedEvents,
      sub: `${draftEvents} borrador${draftEvents !== 1 ? "es" : ""}`,
      icon: CalendarDays,
      href: "/admin/eventos",
      color: "#22c55e",
    },
    {
      label: "Artistas",
      value: visibleArtists,
      sub: `${artists.length} total`,
      icon: Users,
      href: "/admin/artistas",
      color: "#3b82f6",
    },
    {
      label: "Galería",
      value: gallery.length,
      sub: "imágenes",
      icon: Image,
      href: "/admin/galeria",
      color: "#a855f7",
    },
    {
      label: "Ventas",
      value: approvedOrders.length,
      sub: `$${totalRevenue.toLocaleString("es-CL")} CLP`,
      icon: ShoppingCart,
      href: "#",
      color: "#eab308",
    },
  ];

  return (
    <div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "0.25rem",
        }}
      >
        Dashboard
      </h1>
      <p
        style={{ fontSize: "0.8125rem", color: "#666", marginBottom: "2rem" }}
      >
        Resumen general del sitio
      </p>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              style={{
                background: "#111",
                border: "1px solid #1a1a1a",
                borderRadius: "0.5rem",
                padding: "1.25rem",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#888",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {stat.label}
                </span>
                <Icon size={16} color={stat.color} />
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                  marginBottom: "0.25rem",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#555" }}>
                {stat.sub}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#fff",
          marginBottom: "1rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Acciones rápidas
      </h2>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {[
          { label: "Nuevo evento", href: "/admin/eventos/nuevo" },
          { label: "Nuevo artista", href: "/admin/artistas/nuevo" },
          { label: "Subir fotos", href: "/admin/galeria" },
          { label: "Editar contenido", href: "/admin/contenido" },
          { label: "Configuración", href: "/admin/configuracion" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="admin-btn admin-btn-secondary"
            style={{ textDecoration: "none", fontSize: "0.8125rem" }}
          >
            {action.label}
          </Link>
        ))}
      </div>

      {/* Warnings */}
      {draftEvents > 0 && (
        <div
          style={{
            marginTop: "2.5rem",
            padding: "1rem 1.25rem",
            background: "rgba(234,179,8,0.06)",
            border: "1px solid rgba(234,179,8,0.2)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertCircle size={16} color="#eab308" />
          <span style={{ fontSize: "0.8125rem", color: "#eab308" }}>
            Tienes {draftEvents} evento{draftEvents !== 1 ? "s" : ""} en
            borrador sin publicar.
          </span>
          <Link
            href="/admin/eventos"
            style={{
              marginLeft: "auto",
              fontSize: "0.75rem",
              color: "#eab308",
              textDecoration: "underline",
            }}
          >
            Ver eventos →
          </Link>
        </div>
      )}
    </div>
  );
}
