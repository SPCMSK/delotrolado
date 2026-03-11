"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface EventItem {
  slug: string;
  name: string;
  date: string;
  venue: string;
  city: string;
  flyer_url: string | null;
  tags: string[];
  dayOfWeek: string;
  day: string;
  month: string;
  doorsOpen: string | null;
}

interface Props {
  upcoming: EventItem[];
  past: EventItem[];
}

export default function EventsView({ upcoming, past }: Props) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const events = tab === "upcoming" ? upcoming : past;

  return (
    <>
      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "32px",
          marginBottom: "48px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "16px",
        }}
      >
        <button
          onClick={() => setTab("upcoming")}
          style={{
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: tab === "upcoming" ? "#fff" : "rgba(255,255,255,0.3)",
            background: "none",
            border: "none",
            cursor: "pointer",
            paddingBottom: tab === "upcoming" ? "16px" : undefined,
            borderBottom: tab === "upcoming" ? "1px solid #fff" : undefined,
            marginBottom: tab === "upcoming" ? "-17px" : undefined,
            transition: "color 0.2s",
          }}
        >
          Próximos ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("past")}
          style={{
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: tab === "past" ? "#fff" : "rgba(255,255,255,0.3)",
            background: "none",
            border: "none",
            cursor: "pointer",
            paddingBottom: tab === "past" ? "16px" : undefined,
            borderBottom: tab === "past" ? "1px solid #fff" : undefined,
            marginBottom: tab === "past" ? "-17px" : undefined,
            transition: "color 0.2s",
          }}
        >
          Pasados ({past.length})
        </button>
      </div>

      {/* Event list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {events.map((event, i) => (
          <Link
            key={event.slug}
            href={`/eventos/${event.slug}`}
            className="group event-row"
            style={{
              display: "grid",
              gridTemplateColumns: event.flyer_url ? "64px 100px 1fr auto" : "100px 1fr auto",
              gap: "40px",
              alignItems: "center",
              padding: "32px 0",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              textDecoration: "none",
              color: "inherit",
              opacity: tab === "past" ? 0.6 : 1,
              animation: `fadeIn 0.6s ease-out ${0.1 * (i + 1)}s both`,
            }}
          >
            {/* Flyer thumbnail */}
            {event.flyer_url && (
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "4px",
                  overflow: "hidden",
                  backgroundColor: "#111",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={event.flyer_url}
                  alt={event.name}
                  width={64}
                  height={64}
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            {/* Date block */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {event.dayOfWeek}
              </span>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {event.day}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {event.month}
              </span>
            </div>

            {/* Event info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3
                className="group-hover:text-white transition-colors duration-300"
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {event.name}
              </h3>
              <div className="event-meta" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                  {event.venue}
                </span>
                <span className="event-meta-sep" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)" }}>
                  ·
                </span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>
                  {event.city}
                </span>
                {event.doorsOpen && (
                  <>
                    <span className="event-meta-sep" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)" }}>
                      ·
                    </span>
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.3)" }}>
                      Apertura {event.doorsOpen}
                    </span>
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                {(event.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.35)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px 10px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <span
              className="group-hover:translate-x-1 transition-transform duration-300 event-row-arrow"
              style={{ fontSize: "20px", color: "rgba(255,255,255,0.2)" }}
            >
              →
            </span>
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "80px 32px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "15px" }}>
            {tab === "upcoming"
              ? "No hay eventos próximos programados."
              : "No hay eventos pasados."}
          </p>
        </div>
      )}
    </>
  );
}
