"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Image,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/artistas", label: "Artistas", icon: Users },
  { href: "/admin/galeria", label: "Galería", icon: Image },
  { href: "/admin/contenido", label: "Contenido", icon: FileText },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar({
  user,
}: {
  user: { email: string; display_name: string | null; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        background: "#0a0a0a",
        borderRight: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#fff",
          }}
        >
          DELOTROLADO
        </div>
        <div
          style={{
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            color: "#555",
            marginTop: "0.25rem",
            textTransform: "uppercase",
          }}
        >
          Admin Panel
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflow: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                fontSize: "0.8125rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#fff" : "#888",
                background: active ? "#1a1a1a" : "transparent",
                transition: "all 0.15s",
                marginBottom: "0.125rem",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#111";
                  e.currentTarget.style.color = "#ccc";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#888";
                }
              }}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "0.75rem 0.5rem",
          borderTop: "1px solid #1a1a1a",
        }}
      >
        {/* Back to site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.625rem 0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.8125rem",
            color: "#666",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        >
          <ExternalLink size={14} />
          Ver sitio
        </a>

        {/* User info + Logout */}
        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid #111",
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#888",
              marginBottom: "0.125rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.display_name || user.email}
          </div>
          <div
            style={{
              fontSize: "0.625rem",
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.75rem",
            }}
          >
            {user.role.replace("_", " ")}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "none",
              border: "none",
              color: "#666",
              fontSize: "0.75rem",
              cursor: "pointer",
              padding: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
