"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ActionResult =
  | { success: true; id?: string }
  | { error: string };

/** Auth guard — throws if not authenticated or not admin */
async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  /* Use security-definer function to bypass RLS circular dependency */
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("Sin permisos de administrador");

  return { supabase, user };
}

/* ════════════════════════════════════════════════
   EVENTS
   ════════════════════════════════════════════════ */

export interface EventInput {
  name: string;
  slug: string;
  description?: string | null;
  date: string;
  doors_open?: string | null;
  doors_close?: string | null;
  venue: string;
  address?: string | null;
  city?: string;
  flyer_url?: string | null;
  hero_url?: string | null;
  status: string;
  tags?: string[];
  min_age?: number | null;
  is_featured?: boolean;
  is_past?: boolean;
}

function validateEvent(data: EventInput): string | null {
  if (!data.name?.trim()) return "El nombre es requerido";
  if (!data.slug?.trim()) return "El slug es requerido";
  if (!/^[a-z0-9-]+$/.test(data.slug)) return "El slug solo puede contener letras minúsculas, números y guiones";
  if (!data.date) return "La fecha es requerida";
  if (!data.venue?.trim()) return "El venue es requerido";
  if (!["draft", "published", "cancelled"].includes(data.status)) return "Estado inválido";
  return null;
}

export async function createEvent(data: EventInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const validationError = validateEvent(data);
    if (validationError) return { error: validationError };

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description?.trim() || null,
        date: data.date,
        doors_open: data.doors_open || null,
        doors_close: data.doors_close || null,
        venue: data.venue.trim(),
        address: data.address?.trim() || null,
        city: data.city?.trim() || "Valparaíso",
        flyer_url: data.flyer_url || null,
        hero_url: data.hero_url || null,
        status: data.status,
        tags: data.tags ?? [],
        min_age: data.min_age ?? null,
        is_featured: data.is_featured ?? false,
        is_past: data.is_past ?? false,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un evento con ese slug" };
      return { error: error.message };
    }

    revalidatePath("/admin/eventos");
    revalidatePath("/eventos");
    revalidatePath("/");
    return { success: true, id: event.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateEvent(
  id: string,
  data: EventInput
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const validationError = validateEvent(data);
    if (validationError) return { error: validationError };

    const { data: updated, error } = await supabase
      .from("events")
      .update({
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description?.trim() || null,
        date: data.date,
        doors_open: data.doors_open || null,
        doors_close: data.doors_close || null,
        venue: data.venue.trim(),
        address: data.address?.trim() || null,
        city: data.city?.trim() || "Valparaíso",
        flyer_url: data.flyer_url || null,
        hero_url: data.hero_url || null,
        status: data.status,
        tags: data.tags ?? [],
        min_age: data.min_age ?? null,
        is_featured: data.is_featured ?? false,
        is_past: data.is_past ?? false,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("updateEvent error:", error);
      if (error.code === "23505") return { error: "Ya existe un evento con ese slug" };
      if (error.code === "PGRST116") return { error: "No se pudo actualizar — verificá permisos" };
      return { error: error.message };
    }

    if (!updated) {
      return { error: "No se pudo actualizar el evento" };
    }

    revalidatePath("/admin/eventos");
    revalidatePath("/eventos");
    revalidatePath(`/eventos/${data.slug}`);
    revalidatePath("/");
    return { success: true, id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/eventos");
    revalidatePath("/eventos");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/* ════════════════════════════════════════════════
   ARTISTS
   ════════════════════════════════════════════════ */

export interface ArtistInput {
  name: string;
  slug: string;
  role: string;
  bio?: string | null;
  photo_url?: string | null;
  instagram_url?: string | null;
  soundcloud_url?: string | null;
  ra_url?: string | null;
  bandcamp_url?: string | null;
  website_url?: string | null;
  genres?: string[];
  sort_order?: number;
  is_visible?: boolean;
}

function validateArtist(data: ArtistInput): string | null {
  if (!data.name?.trim()) return "El nombre es requerido";
  if (!data.slug?.trim()) return "El slug es requerido";
  if (!/^[a-z0-9-]+$/.test(data.slug)) return "El slug solo puede contener letras minúsculas, números y guiones";
  if (!["dj", "live", "resident", "guest"].includes(data.role)) return "Rol inválido";
  return null;
}

export async function createArtist(data: ArtistInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const validationError = validateArtist(data);
    if (validationError) return { error: validationError };

    const { data: artist, error } = await supabase
      .from("artists")
      .insert({
        name: data.name.trim(),
        slug: data.slug.trim(),
        role: data.role,
        bio: data.bio?.trim() || null,
        photo_url: data.photo_url || null,
        instagram_url: data.instagram_url?.trim() || null,
        soundcloud_url: data.soundcloud_url?.trim() || null,
        ra_url: data.ra_url?.trim() || null,
        bandcamp_url: data.bandcamp_url?.trim() || null,
        website_url: data.website_url?.trim() || null,
        genres: data.genres ?? [],
        sort_order: data.sort_order ?? 0,
        is_visible: data.is_visible ?? true,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un artista con ese slug" };
      return { error: error.message };
    }

    revalidatePath("/admin/artistas");
    revalidatePath("/artistas");
    return { success: true, id: artist.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateArtist(
  id: string,
  data: ArtistInput
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const validationError = validateArtist(data);
    if (validationError) return { error: validationError };

    const { data: updated, error } = await supabase
      .from("artists")
      .update({
        name: data.name.trim(),
        slug: data.slug.trim(),
        role: data.role,
        bio: data.bio?.trim() || null,
        photo_url: data.photo_url || null,
        instagram_url: data.instagram_url?.trim() || null,
        soundcloud_url: data.soundcloud_url?.trim() || null,
        ra_url: data.ra_url?.trim() || null,
        bandcamp_url: data.bandcamp_url?.trim() || null,
        website_url: data.website_url?.trim() || null,
        genres: data.genres ?? [],
        sort_order: data.sort_order ?? 0,
        is_visible: data.is_visible ?? true,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("updateArtist error:", error);
      if (error.code === "23505") return { error: "Ya existe un artista con ese slug" };
      if (error.code === "PGRST116") return { error: "No se pudo actualizar — verificá permisos" };
      return { error: error.message };
    }

    if (!updated) {
      return { error: "No se pudo actualizar el artista" };
    }

    revalidatePath("/admin/artistas");
    revalidatePath("/artistas");
    revalidatePath(`/artistas/${data.slug}`);
    return { success: true, id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteArtist(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("artists").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/artistas");
    revalidatePath("/artistas");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/* ════════════════════════════════════════════════
   GALLERY
   ════════════════════════════════════════════════ */

export interface GalleryInput {
  event_id?: string | null;
  url: string;
  alt?: string | null;
  caption?: string | null;
  photographer?: string | null;
  is_visible?: boolean;
  sort_order?: number;
}

export async function createGalleryImage(
  data: GalleryInput
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!data.url?.trim()) return { error: "La URL de imagen es requerida" };

    const { data: img, error } = await supabase
      .from("gallery_images")
      .insert({
        event_id: data.event_id || null,
        url: data.url.trim(),
        alt: data.alt?.trim() || null,
        caption: data.caption?.trim() || null,
        photographer: data.photographer?.trim() || null,
        is_visible: data.is_visible ?? true,
        sort_order: data.sort_order ?? 0,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");
    return { success: true, id: img.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateGalleryImage(
  id: string,
  data: Partial<GalleryInput>
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: updated, error } = await supabase
      .from("gallery_images")
      .update({
        ...(data.event_id !== undefined && { event_id: data.event_id || null }),
        ...(data.url && { url: data.url.trim() }),
        ...(data.alt !== undefined && { alt: data.alt?.trim() || null }),
        ...(data.caption !== undefined && { caption: data.caption?.trim() || null }),
        ...(data.photographer !== undefined && {
          photographer: data.photographer?.trim() || null,
        }),
        ...(data.is_visible !== undefined && { is_visible: data.is_visible }),
        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("updateGalleryImage error:", error);
      return { error: error.message };
    }

    if (!updated) {
      return { error: "No se pudo actualizar la imagen" };
    }

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");
    return { success: true, id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/* ════════════════════════════════════════════════
   SITE SETTINGS
   ════════════════════════════════════════════════ */

export interface SiteSettingsInput {
  site_name?: string;
  site_tagline?: string | null;
  site_description?: string | null;
  contact_email?: string | null;
  instagram_url?: string | null;
  soundcloud_url?: string | null;
  ra_url?: string | null;
  logo_url?: string | null;
  logo_dark_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_cta_text?: string | null;
  hero_cta_link?: string | null;
  hero_bg_url?: string | null;
  hero_bg_type?: string | null;
  footer_text?: string | null;
  ethos_text?: string | null;
  min_age_default?: number | null;
  currency?: string;
  timezone?: string;
}

export async function updateSiteSettings(
  data: SiteSettingsInput
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    /* Get the single settings row */
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .limit(1)
      .single();

    if (!existing) return { error: "No se encontró la configuración" };

    const { data: updated, error } = await supabase
      .from("site_settings")
      .update(data)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) {
      console.error("updateSiteSettings error:", error);
      return { error: error.message };
    }

    if (!updated) {
      return { error: "No se pudo actualizar la configuración" };
    }

    revalidatePath("/admin/configuracion");
    revalidatePath("/");
    revalidatePath("/info");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/* ════════════════════════════════════════════════
   PAGE CONTENT
   ════════════════════════════════════════════════ */

export interface PageContentInput {
  page_slug: string;
  section_key: string;
  title?: string | null;
  body?: string | null;
  sort_order?: number;
  is_visible?: boolean;
}

function validatePageContent(data: PageContentInput): string | null {
  if (!data.page_slug?.trim()) return "El page_slug es requerido";
  if (!data.section_key?.trim()) return "El section_key es requerido";
  return null;
}

export async function createPageContent(
  data: PageContentInput
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const validationError = validatePageContent(data);
    if (validationError) return { error: validationError };

    const { data: row, error } = await supabase
      .from("page_content")
      .insert({
        page_slug: data.page_slug.trim(),
        section_key: data.section_key.trim(),
        title: data.title?.trim() || null,
        body: data.body?.trim() || null,
        sort_order: data.sort_order ?? 0,
        is_visible: data.is_visible ?? true,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505")
        return { error: "Ya existe un bloque con esa clave para esa página" };
      return { error: error.message };
    }

    revalidatePath("/admin/contenido");
    revalidatePath(`/${data.page_slug}`);
    return { success: true, id: row.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updatePageContent(
  id: string,
  data: Partial<PageContentInput>
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title?.trim() || null;
    if (data.body !== undefined) updateData.body = data.body?.trim() || null;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.is_visible !== undefined) updateData.is_visible = data.is_visible;

    const { data: updated, error } = await supabase
      .from("page_content")
      .update(updateData)
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("updatePageContent error:", error);
      return { error: error.message };
    }

    if (!updated) {
      return { error: "No se pudo actualizar el contenido" };
    }

    revalidatePath("/admin/contenido");
    if (data.page_slug) revalidatePath(`/${data.page_slug}`);
    return { success: true, id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deletePageContent(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("page_content")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/contenido");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/* ════════════════════════════════════════════════
   TICKET TYPES
   ════════════════════════════════════════════════ */

export interface TicketTypeInput {
  event_id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  max_per_order?: number;
  sale_start?: string | null;
  sale_end?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

function validateTicketType(data: TicketTypeInput): string | null {
  if (!data.event_id) return "El evento es requerido";
  if (!data.name?.trim()) return "El nombre es requerido";
  if (data.price < 0) return "El precio no puede ser negativo";
  if (data.stock < 0) return "El stock no puede ser negativo";
  return null;
}

export async function createTicketType(
  data: TicketTypeInput
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const validationError = validateTicketType(data);
    if (validationError) return { error: validationError };

    const { data: ticket, error } = await supabase
      .from("ticket_types")
      .insert({
        event_id: data.event_id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price,
        stock: data.stock,
        max_per_order: data.max_per_order ?? 4,
        sale_start: data.sale_start || null,
        sale_end: data.sale_end || null,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order ?? 0,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/admin/eventos");
    return { success: true, id: ticket.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateTicketType(
  id: string,
  data: Partial<TicketTypeInput>
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: updated, error } = await supabase
      .from("ticket_types")
      .update({
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && {
          description: data.description?.trim() || null,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.max_per_order !== undefined && {
          max_per_order: data.max_per_order,
        }),
        ...(data.sale_start !== undefined && {
          sale_start: data.sale_start || null,
        }),
        ...(data.sale_end !== undefined && {
          sale_end: data.sale_end || null,
        }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("updateTicketType error:", error);
      return { error: error.message };
    }

    if (!updated) {
      return { error: "No se pudo actualizar el tipo de entrada" };
    }

    revalidatePath("/admin/eventos");
    return { success: true, id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteTicketType(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("ticket_types")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/eventos");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/* ════════════════════════════════════════════════
   LINEUP (event_artists)
   ════════════════════════════════════════════════ */

export interface LineupInput {
  event_id: string;
  artist_id: string;
  set_time?: string | null;
  set_end?: string | null;
  set_type?: string;
  is_headliner?: boolean;
  sort_order?: number;
}

export async function addToLineup(data: LineupInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!data.event_id || !data.artist_id) return { error: "Evento y artista son requeridos" };

    const { data: row, error } = await supabase
      .from("event_artists")
      .insert({
        event_id: data.event_id,
        artist_id: data.artist_id,
        set_time: data.set_time || null,
        set_end: data.set_end || null,
        set_type: data.set_type || "DJ Set",
        is_headliner: data.is_headliner ?? false,
        sort_order: data.sort_order ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Este artista ya está en el lineup" };
      return { error: error.message };
    }

    revalidatePath("/admin/eventos");
    return { success: true, id: row.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function removeFromLineup(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("event_artists")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/eventos");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

/* ════════════════════════════════════════════════
   ORDERS (admin)
   ════════════════════════════════════════════════ */

export async function getOrders(filters?: { event_id?: string; status?: string }) {
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("orders")
    .select("*, event:events(name, slug)")
    .order("created_at", { ascending: false });

  if (filters?.event_id) query = query.eq("event_id", filters.event_id);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    event: Array.isArray(row.event) ? (row.event as Record<string, unknown>[])[0] : row.event,
  }));
}

export async function getOrderTickets(orderId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("tickets")
    .select("*, ticket_type:ticket_types(name)")
    .eq("order_id", orderId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    ticket_type: Array.isArray(row.ticket_type) ? (row.ticket_type as Record<string, unknown>[])[0] : row.ticket_type,
  }));
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!["pending", "approved", "rejected", "refunded"].includes(status)) {
      return { error: "Estado inválido" };
    }

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) return { error: error.message };

    // If approving, update sold counts
    if (status === "approved") {
      const { data: tickets } = await supabase
        .from("tickets")
        .select("ticket_type_id")
        .eq("order_id", orderId);

      if (tickets) {
        const counts: Record<string, number> = {};
        for (const t of tickets) {
          counts[t.ticket_type_id] = (counts[t.ticket_type_id] || 0) + 1;
        }
        for (const [typeId, qty] of Object.entries(counts)) {
          const { data: tt } = await supabase
            .from("ticket_types")
            .select("sold")
            .eq("id", typeId)
            .single();
          if (tt) {
            await supabase
              .from("ticket_types")
              .update({ sold: tt.sold + qty })
              .eq("id", typeId);
          }
        }
      }
    }

    revalidatePath("/admin/ventas");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function validateTicketQR(qrCode: string): Promise<
  | { success: true; ticket: { id: string; qr_code: string; is_used: boolean; used_at: string | null; order_name: string; order_email: string; event_name: string; ticket_type_name: string } }
  | { error: string }
> {
  try {
    const { supabase } = await requireAdmin();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        id, qr_code, is_used, used_at,
        order:orders(name, email, event:events(name)),
        ticket_type:ticket_types(name)
      `)
      .eq("qr_code", qrCode.trim().toUpperCase())
      .single();

    if (error || !ticket) {
      return { error: "Código QR no encontrado" };
    }

    const order = Array.isArray(ticket.order) ? ticket.order[0] : ticket.order;
    const tt = Array.isArray(ticket.ticket_type) ? ticket.ticket_type[0] : ticket.ticket_type;
    const event = order?.event ? (Array.isArray(order.event) ? order.event[0] : order.event) : null;

    return {
      success: true,
      ticket: {
        id: ticket.id,
        qr_code: ticket.qr_code,
        is_used: ticket.is_used,
        used_at: ticket.used_at,
        order_name: order?.name ?? "—",
        order_email: order?.email ?? "—",
        event_name: event?.name ?? "—",
        ticket_type_name: tt?.name ?? "—",
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function markTicketUsed(ticketId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("tickets")
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (error) return { error: error.message };

    revalidatePath("/admin/scanner");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
