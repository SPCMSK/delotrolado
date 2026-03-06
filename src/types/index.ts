/* ── Core types for delotrolado.club ── */

export interface Event {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  date: string; // ISO date
  doors_open: string | null; // HH:mm
  doors_close: string | null; // HH:mm
  venue: string;
  address: string | null;
  city: string;
  flyer_url: string | null;
  hero_url: string | null;
  status: "draft" | "published" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string; // e.g. "Early Bird", "General", "VIP"
  price: number; // in CLP (integer)
  stock: number;
  max_per_order: number;
  sale_start: string | null; // ISO datetime
  sale_end: string | null; // ISO datetime
  is_active: boolean;
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  role: "dj" | "live" | "resident" | "guest";
  bio: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  ra_url: string | null;
  bandcamp_url: string | null;
  created_at: string;
}

export interface EventArtist {
  event_id: string;
  artist_id: string;
  set_time: string | null; // HH:mm
  is_headliner: boolean;
}

export interface GalleryImage {
  id: string;
  event_id: string;
  url: string;
  alt: string | null;
  photographer: string | null;
  order: number;
  created_at: string;
}

export interface Order {
  id: string;
  event_id: string;
  email: string;
  name: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  total: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string; // UUID
  order_id: string;
  ticket_type_id: string;
  qr_code: string; // signed token
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}
