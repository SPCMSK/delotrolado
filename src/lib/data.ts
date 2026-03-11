import { supabase } from "./supabase";

/* ── Helper: format time from "HH:MM:SS" to "HH:MM" ── */
function fmtTime(t: string | null): string | null {
  if (!t) return null;
  return t.slice(0, 5);
}

/* ── Helper: Spanish day-of-week abbreviation ── */
const DAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MONTH_NAMES = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00"); // avoid timezone shift
  return {
    dayOfWeek: DAY_NAMES[d.getDay()],
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTH_NAMES[d.getMonth()],
    year: d.getFullYear(),
  };
}

/* ════════════════════════════════════════════════
   SITE SETTINGS (single-row global config)
   ════════════════════════════════════════════════ */

export interface SiteSettings {
  id: string;
  site_name: string;
  site_tagline: string | null;
  site_description: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  ra_url: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  hero_bg_url: string | null;
  hero_bg_type: string | null;
  footer_text: string | null;
  ethos_text: string | null;
  min_age_default: number | null;
  currency: string;
  timezone: string;
  updated_at: string;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Error fetching site settings:", error);
    return null;
  }
  return data;
}

/* ════════════════════════════════════════════════
   PAGE CONTENT (editable text blocks)
   ════════════════════════════════════════════════ */

export interface PageContentBlock {
  id: string;
  page_slug: string;
  section_key: string;
  title: string | null;
  body: string | null;
  sort_order: number;
  is_visible: boolean;
}

export async function getPageContent(pageSlug: string): Promise<PageContentBlock[]> {
  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("page_slug", pageSlug)
    .eq("is_visible", true)
    .order("sort_order");

  if (error) {
    console.error(`Error fetching page content for ${pageSlug}:`, error);
    return [];
  }
  return data ?? [];
}

/* ════════════════════════════════════════════════
   EVENTS
   ════════════════════════════════════════════════ */

export interface EventRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  date: string;
  doors_open: string | null;
  doors_close: string | null;
  venue: string;
  address: string | null;
  city: string;
  flyer_url: string | null;
  hero_url: string | null;
  status: string;
  tags: string[];
  min_age: number | null;
  is_featured: boolean;
  is_past: boolean;
  created_at: string;
}

export interface EventWithDate extends EventRow {
  dayOfWeek: string;
  day: string;
  month: string;
  year: number;
  doorsOpen: string | null;
  doorsClose: string | null;
}

export async function getPublishedEvents(): Promise<EventWithDate[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return (data ?? []).map((e) => ({
    ...e,
    ...parseDateParts(e.date),
    doorsOpen: fmtTime(e.doors_open),
    doorsClose: fmtTime(e.doors_close),
  }));
}

/** Split published events into upcoming and past using the is_past field */
export async function getPublishedEventsSplit(): Promise<{
  upcoming: EventWithDate[];
  past: EventWithDate[];
}> {
  const all = await getPublishedEvents();

  const upcoming: EventWithDate[] = [];
  const past: EventWithDate[] = [];

  for (const e of all) {
    if (e.is_past) {
      past.push(e);
    } else {
      upcoming.push(e);
    }
  }

  // Past events: most recent first
  past.reverse();

  return { upcoming, past };
}

export async function getEventBySlug(slug: string): Promise<EventWithDate | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;

  return {
    ...data,
    ...parseDateParts(data.date),
    doorsOpen: fmtTime(data.doors_open),
    doorsClose: fmtTime(data.doors_close),
  };
}

/* ════════════════════════════════════════════════
   ARTISTS
   ════════════════════════════════════════════════ */

export interface ArtistRow {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  soundcloud_url: string | null;
  ra_url: string | null;
  bandcamp_url: string | null;
  website_url: string | null;
  genres: string[];
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

export async function getArtists(): Promise<ArtistRow[]> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("Error fetching artists:", error);
    return [];
  }

  return data ?? [];
}

export async function getArtistBySlug(slug: string): Promise<ArtistRow | null> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();

  if (error || !data) return null;
  return data;
}

/* ════════════════════════════════════════════════
   LINEUP (event_artists + artist join)
   ════════════════════════════════════════════════ */

export interface LineupEntry {
  id: string;
  set_time: string | null;
  set_end: string | null;
  set_type: string;
  is_headliner: boolean;
  sort_order: number;
  artist: {
    slug: string;
    name: string;
    role: string;
    photo_url: string | null;
  };
}

export async function getEventLineup(eventId: string): Promise<LineupEntry[]> {
  const { data, error } = await supabase
    .from("event_artists")
    .select(`
      id,
      set_time,
      set_end,
      set_type,
      is_headliner,
      sort_order,
      artist:artists (slug, name, role, photo_url)
    `)
    .eq("event_id", eventId)
    .order("sort_order");

  if (error) {
    console.error("Error fetching lineup:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    set_time: fmtTime(row.set_time),
    set_end: fmtTime(row.set_end),
    artist: Array.isArray(row.artist) ? row.artist[0] : row.artist,
  })) as LineupEntry[];
}

export async function getArtistEvents(artistId: string): Promise<(EventWithDate & { set_type: string })[]> {
  const { data, error } = await supabase
    .from("event_artists")
    .select(`
      set_type,
      event:events (*)
    `)
    .eq("artist_id", artistId);

  if (error || !data) return [];

  return data
    .map((row) => {
      const e = Array.isArray(row.event) ? row.event[0] : row.event;
      if (!e || e.status !== "published") return null;
      return {
        ...e,
        ...parseDateParts(e.date),
        doorsOpen: fmtTime(e.doors_open),
        doorsClose: fmtTime(e.doors_close),
        set_type: row.set_type,
      };
    })
    .filter(Boolean) as (EventWithDate & { set_type: string })[];
}

/* ════════════════════════════════════════════════
   TICKET TYPES
   ════════════════════════════════════════════════ */

export interface TicketTypeRow {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sold: number;
  max_per_order: number;
  is_active: boolean;
  sort_order: number;
}

export async function getTicketTypes(eventId: string): Promise<TicketTypeRow[]> {
  const { data, error } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order");

  if (error) {
    console.error("Error fetching ticket types:", error);
    return [];
  }

  return data ?? [];
}

/* ════════════════════════════════════════════════
   GALLERY
   ════════════════════════════════════════════════ */

export interface GalleryImageRow {
  id: string;
  event_id: string | null;
  url: string;
  alt: string | null;
  caption: string | null;
  photographer: string | null;
  is_visible: boolean;
  sort_order: number;
  event?: { name: string; slug: string } | null;
}

export async function getGalleryImages(): Promise<GalleryImageRow[]> {
  const { data, error } = await supabase
    .from("gallery_images")
    .select(`
      *,
      event:events (name, slug)
    `)
    .order("sort_order");

  if (error) {
    console.error("Error fetching gallery:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    event: Array.isArray(row.event) ? row.event[0] : row.event,
  }));
}

/* ════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════ */

const ROLE_LABELS: Record<string, string> = {
  resident: "Residente",
  dj: "DJ",
  live: "Live",
  guest: "Invitado",
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-CL")}`;
}

export function ticketStatus(t: TicketTypeRow): string {
  if (!t.is_active) return "No disponible";
  if (t.stock > 0 && t.sold >= t.stock) return "Agotado";
  if (t.stock === 0) return "En puerta";
  return "Disponible";
}

export function formatDateLong(dateStr: string): string {
  const parts = parseDateParts(dateStr);
  return `${parts.day} ${parts.month} ${parts.year}`;
}

/* ════════════════════════════════════════════════
   ORDERS (admin)
   ════════════════════════════════════════════════ */

export interface OrderRow {
  id: string;
  event_id: string;
  email: string;
  name: string;
  phone: string | null;
  status: string;
  total: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
  event?: { name: string; slug: string } | null;
}

export interface TicketRow {
  id: string;
  order_id: string;
  ticket_type_id: string;
  qr_code: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  ticket_type?: { name: string } | null;
}
