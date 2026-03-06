"use client";

import { useState } from "react";
import { deleteEvent } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";

export function EventDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteEvent(id);
    if ("error" in result) {
      alert(`Error: ${result.error}`);
      setLoading(false);
      setConfirming(false);
    } else {
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <span style={{ display: "inline-flex", gap: "0.375rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.6875rem", color: "#ef4444" }}>
          ¿Eliminar &quot;{name}&quot;?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: 600,
            textDecoration: "underline",
            padding: 0,
          }}
        >
          {loading ? "…" : "Sí"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            fontSize: "0.75rem",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        background: "none",
        border: "none",
        color: "#666",
        cursor: "pointer",
        fontSize: "0.75rem",
        textDecoration: "underline",
        padding: 0,
      }}
    >
      Eliminar
    </button>
  );
}
