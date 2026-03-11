"use client";

import { useState, useEffect } from "react";
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
  ShoppingCart,
  ScanLine,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/artistas", label: "Artistas", icon: Users },
  { href: "/admin/galeria", label: "Galería", icon: Image },
  { href: "/admin/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/admin/scanner", label: "Scanner QR", icon: ScanLine },
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
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

  const sidebarContent = (
    <>
      {/* Header */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
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
        {/* Close button — mobile only */}
        <button
          className="admin-mobile-only"
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={20} />
        </button>
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
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="admin-topbar">
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <Menu size={22} />
        </button>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#fff",
          }}
        >
          DELOTROLADO
        </span>
        <div style={{ width: "30px" }} />
      </div>

      {/* Desktop sidebar */}
      <aside className="admin-sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <>
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setOpen(false)}
          />
          <aside className="admin-sidebar-mobile">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
