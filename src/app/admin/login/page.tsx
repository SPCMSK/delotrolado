"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const unauthorizedError = searchParams.get("error") === "unauthorized";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password) {
      setError("Email y contraseña son requeridos");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowser();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Credenciales inválidas"
            : `Error: ${authError.message}`
        );
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            DELOTROLADO
          </h1>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            Panel de Administración
          </p>
        </div>

        {/* Error from middleware (unauthorized) */}
        {unauthorizedError && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.375rem",
              color: "#ef4444",
              fontSize: "0.8125rem",
              marginBottom: "1.5rem",
            }}
          >
            No tienes permisos de administrador.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#888",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              className="admin-input"
              placeholder="admin@delotrolado.club"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#888",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="admin-input"
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "0.375rem",
                color: "#ef4444",
                fontSize: "0.8125rem",
                marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            fontSize: "0.75rem",
            color: "#444",
          }}
        >
          <a href="/" style={{ color: "#666", textDecoration: "underline" }}>
            ← Volver al sitio
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
