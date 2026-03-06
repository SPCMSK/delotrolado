-- ============================================================
-- delotrolado.club — Database Schema (Complete CMS)
-- Run this in Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- ── Enable extensions ──
create extension if not exists "uuid-ossp";

-- ── Auto-update updated_at trigger ──
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================================
-- 0. ADMIN USERS (links to Supabase Auth)
-- ============================================================
create table if not exists admin_users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  role          text not null default 'editor' check (role in ('editor', 'admin', 'super_admin')),
  created_at    timestamptz not null default now()
);

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from admin_users where id = auth.uid()
  );
end;
$$ language plpgsql security definer;


-- ============================================================
-- 1. SITE SETTINGS (single-row global config)
-- ============================================================
create table if not exists site_settings (
  id                uuid primary key default uuid_generate_v4(),
  site_name         text not null default 'delotrolado',
  site_tagline      text default 'CLUB',
  site_description  text default 'Portal oficial del colectivo delotrolado — eventos, artistas, entradas y galería.',
  contact_email     text default 'contacto@delotrolado.club',
  instagram_url     text default 'https://www.instagram.com/__delotrolado/',
  soundcloud_url    text,
  ra_url            text,
  logo_url          text default '/logos/LOGO-BLANCO.png',
  logo_dark_url     text,
  hero_title        text default 'DELOTROLADO',
  hero_subtitle     text default 'CLUB',
  hero_cta_text     text default 'Ver eventos',
  hero_cta_link     text default '/eventos',
  footer_text       text default 'Portal oficial del colectivo delotrolado — eventos, artistas, entradas y galería.',
  ethos_text        text default 'No fotos · No flash · No teléfonos en pista',
  min_age_default   int default 18,
  currency          text default 'CLP',
  timezone          text default 'America/Santiago',
  updated_at        timestamptz not null default now()
);

create trigger trg_site_settings_updated
  before update on site_settings
  for each row execute function update_updated_at();


-- ============================================================
-- 2. PAGE CONTENT (editable text blocks for any page)
-- ============================================================
create table if not exists page_content (
  id          uuid primary key default uuid_generate_v4(),
  page_slug   text not null,
  section_key text not null,
  title       text,
  body        text,
  sort_order  int not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(page_slug, section_key)
);

create trigger trg_page_content_updated
  before update on page_content
  for each row execute function update_updated_at();


-- ============================================================
-- 3. ARTISTS
-- ============================================================
create table if not exists artists (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  name            text not null,
  role            text not null default 'dj' check (role in ('dj', 'live', 'resident', 'guest')),
  bio             text,
  photo_url       text,
  instagram_url   text,
  soundcloud_url  text,
  ra_url          text,
  bandcamp_url    text,
  website_url     text,
  genres          text[] default '{}',
  sort_order      int not null default 0,
  is_visible      boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_artists_updated
  before update on artists
  for each row execute function update_updated_at();


-- ============================================================
-- 4. EVENTS
-- ============================================================
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  description text,
  date        date not null,
  doors_open  time,
  doors_close time,
  venue       text not null,
  address     text,
  city        text not null default 'Valparaíso',
  flyer_url   text,
  hero_url    text,
  status      text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  tags        text[] default '{}',
  min_age     int,
  is_featured boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_events_updated
  before update on events
  for each row execute function update_updated_at();


-- ============================================================
-- 5. EVENT_ARTISTS (many-to-many: lineup)
-- ============================================================
create table if not exists event_artists (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid not null references events(id) on delete cascade,
  artist_id     uuid not null references artists(id) on delete cascade,
  set_time      time,
  set_end       time,
  set_type      text default 'DJ Set' check (set_type in ('DJ Set', 'Live', 'B2B', 'Hybrid')),
  is_headliner  boolean not null default false,
  sort_order    int not null default 0,
  unique(event_id, artist_id)
);


-- ============================================================
-- 6. TICKET_TYPES
-- ============================================================
create table if not exists ticket_types (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid not null references events(id) on delete cascade,
  name          text not null,
  description   text,
  price         int not null,
  stock         int not null default 0,
  sold          int not null default 0,
  max_per_order int not null default 4,
  sale_start    timestamptz,
  sale_end      timestamptz,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);


-- ============================================================
-- 7. ORDERS
-- ============================================================
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  event_id          uuid not null references events(id) on delete restrict,
  email             text not null,
  name              text not null,
  phone             text,
  status            text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'refunded')),
  total             int not null,
  mp_preference_id  text,
  mp_payment_id     text,
  idempotency_key   text unique not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger trg_orders_updated
  before update on orders
  for each row execute function update_updated_at();


-- ============================================================
-- 8. TICKETS (one per entry, with QR code)
-- ============================================================
create table if not exists tickets (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id) on delete cascade,
  ticket_type_id  uuid not null references ticket_types(id) on delete restrict,
  qr_code         text unique not null,
  is_used         boolean not null default false,
  used_at         timestamptz,
  created_at      timestamptz not null default now()
);


-- ============================================================
-- 9. GALLERY_IMAGES
-- ============================================================
create table if not exists gallery_images (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid references events(id) on delete set null,
  url           text not null,
  alt           text,
  caption       text,
  photographer  text,
  is_visible    boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_events_status_date on events(status, date desc);
create index if not exists idx_events_slug on events(slug);
create index if not exists idx_events_featured on events(is_featured) where is_featured = true;
create index if not exists idx_artists_slug on artists(slug);
create index if not exists idx_artists_visible on artists(is_visible) where is_visible = true;
create index if not exists idx_event_artists_event on event_artists(event_id);
create index if not exists idx_event_artists_artist on event_artists(artist_id);
create index if not exists idx_ticket_types_event on ticket_types(event_id);
create index if not exists idx_orders_event on orders(event_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_tickets_order on tickets(order_id);
create index if not exists idx_gallery_event on gallery_images(event_id);
create index if not exists idx_gallery_visible on gallery_images(is_visible) where is_visible = true;
create index if not exists idx_page_content_page on page_content(page_slug);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table admin_users enable row level security;
alter table site_settings enable row level security;
alter table page_content enable row level security;
alter table artists enable row level security;
alter table events enable row level security;
alter table event_artists enable row level security;
alter table ticket_types enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;
alter table gallery_images enable row level security;

-- ── PUBLIC READ POLICIES (anon + authenticated) ──

create policy "Public can read site settings"
  on site_settings for select using (true);

create policy "Public can read visible page content"
  on page_content for select using (is_visible = true);

create policy "Public can read visible artists"
  on artists for select using (is_visible = true);

create policy "Public can read published events"
  on events for select using (status = 'published');

create policy "Public can read event artists for published events"
  on event_artists for select using (
    exists (select 1 from events where events.id = event_artists.event_id and events.status = 'published')
  );

create policy "Public can read active ticket types"
  on ticket_types for select using (
    is_active = true and
    exists (select 1 from events where events.id = ticket_types.event_id and events.status = 'published')
  );

create policy "Public can read visible gallery images"
  on gallery_images for select using (is_visible = true);

-- ── ADMIN WRITE POLICIES (full CRUD for admins) ──

-- Admin users: only super_admin can manage other admins
create policy "Admins can read admin_users"
  on admin_users for select using (is_admin());

create policy "Super admins can manage admin_users"
  on admin_users for all using (
    exists (select 1 from admin_users where id = auth.uid() and role = 'super_admin')
  ) with check (
    exists (select 1 from admin_users where id = auth.uid() and role = 'super_admin')
  );

-- Site settings: admins can update
create policy "Admins can update site settings"
  on site_settings for update using (is_admin()) with check (is_admin());

-- Page content: admins have full CRUD
create policy "Admins can manage page content"
  on page_content for all using (is_admin()) with check (is_admin());

-- Artists: admins have full CRUD + can read ALL (including hidden)
create policy "Admins can read all artists"
  on artists for select using (is_admin());

create policy "Admins can insert artists"
  on artists for insert with check (is_admin());

create policy "Admins can update artists"
  on artists for update using (is_admin()) with check (is_admin());

create policy "Admins can delete artists"
  on artists for delete using (is_admin());

-- Events: admins have full CRUD + can read ALL (including drafts)
create policy "Admins can read all events"
  on events for select using (is_admin());

create policy "Admins can insert events"
  on events for insert with check (is_admin());

create policy "Admins can update events"
  on events for update using (is_admin()) with check (is_admin());

create policy "Admins can delete events"
  on events for delete using (is_admin());

-- Event artists: admins have full CRUD
create policy "Admins can manage event artists"
  on event_artists for all using (is_admin()) with check (is_admin());

-- Ticket types: admins have full CRUD
create policy "Admins can manage ticket types"
  on ticket_types for all using (is_admin()) with check (is_admin());

-- Gallery: admins have full CRUD + can read ALL (including hidden)
create policy "Admins can read all gallery images"
  on gallery_images for select using (is_admin());

create policy "Admins can insert gallery images"
  on gallery_images for insert with check (is_admin());

create policy "Admins can update gallery images"
  on gallery_images for update using (is_admin()) with check (is_admin());

create policy "Admins can delete gallery images"
  on gallery_images for delete using (is_admin());

-- Orders: admins can read and update all orders
create policy "Admins can read all orders"
  on orders for select using (is_admin());

create policy "Admins can update orders"
  on orders for update using (is_admin()) with check (is_admin());

-- Tickets: admins can read and update all tickets
create policy "Admins can read all tickets"
  on tickets for select using (is_admin());

create policy "Admins can update tickets"
  on tickets for update using (is_admin()) with check (is_admin());




-- ============================================================
-- STORAGE BUCKETS (for images)
-- ============================================================
insert into storage.buckets (id, name, public) values ('flyers', 'flyers', true);
insert into storage.buckets (id, name, public) values ('artists', 'artists', true);
insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);
insert into storage.buckets (id, name, public) values ('site', 'site', true);

create policy "Public read flyers" on storage.objects for select using (bucket_id = 'flyers');
create policy "Public read artists" on storage.objects for select using (bucket_id = 'artists');
create policy "Public read gallery" on storage.objects for select using (bucket_id = 'gallery');
create policy "Public read site" on storage.objects for select using (bucket_id = 'site');

create policy "Admin upload flyers" on storage.objects for insert with check (bucket_id = 'flyers' and is_admin());
create policy "Admin delete flyers" on storage.objects for delete using (bucket_id = 'flyers' and is_admin());
create policy "Admin upload artists" on storage.objects for insert with check (bucket_id = 'artists' and is_admin());
create policy "Admin delete artists" on storage.objects for delete using (bucket_id = 'artists' and is_admin());
create policy "Admin upload gallery" on storage.objects for insert with check (bucket_id = 'gallery' and is_admin());
create policy "Admin delete gallery" on storage.objects for delete using (bucket_id = 'gallery' and is_admin());
create policy "Admin upload site" on storage.objects for insert with check (bucket_id = 'site' and is_admin());
create policy "Admin delete site" on storage.objects for delete using (bucket_id = 'site' and is_admin());



insert into site_settings (
  site_name, site_tagline, site_description, contact_email,
  instagram_url, logo_url, hero_title, hero_subtitle,
  hero_cta_text, hero_cta_link, footer_text, ethos_text
) values (
  'delotrolado', 'CLUB',
  'Portal oficial del colectivo delotrolado — eventos, artistas, entradas y galería.',
  'contacto@delotrolado.club',
  'https://www.instagram.com/__delotrolado/',
  '/logos/LOGO-BLANCO.png',
  'DELOTROLADO', 'CLUB',
  'Ver eventos', '/eventos',
  'Portal oficial del colectivo delotrolado — eventos, artistas, entradas y galería.',
  'No fotos · No flash · No teléfonos en pista'
);


insert into page_content (page_slug, section_key, title, body, sort_order) values
  ('info', 'about_title', '¿Qué es delotrolado?', null, 1),
  ('info', 'about_body_1', null, 'Delotrolado es un colectivo dedicado a la música electrónica underground. Nacimos de la necesidad de crear espacios donde el sonido y la experiencia colectiva fueran lo central — lejos de lo comercial, lejos de lo obvio.', 2),
  ('info', 'about_body_2', null, 'Organizamos fiestas en espacios no convencionales de Valparaíso y Santiago, con un foco en techno, industrial, dub y ambient. Cada evento es una pieza única — curada, íntima y sin compromisos.', 3),
  ('info', 'about_body_3', null, 'Creemos en la pista de baile como ritual, en el anonimato como libertad, y en que la mejor música se encuentra del otro lado.', 4),
  ('info', 'contact_intro', 'Contacto', 'Consultas generales, prensa y booking:', 10),
  ('info', 'location', 'Ubicación', 'Valparaíso / Santiago, Chile', 20);


insert into page_content (page_slug, section_key, title, body, sort_order) values
  ('privacidad', 'section_1', '1. Datos recopilados', 'Al comprar entradas en delotrolado.club, recopilamos la información necesaria para procesar tu compra: nombre, correo electrónico y datos de contacto. No almacenamos información financiera — los pagos son procesados íntegramente por MercadoPago.', 1),
  ('privacidad', 'section_2', '2. Uso de la información', 'Tu información se utiliza exclusivamente para: procesar y confirmar tu compra de entradas, enviarte la entrada digital con código QR, contactarte en caso de cambios o cancelación del evento.', 2),
  ('privacidad', 'section_3', '3. Compartición de datos', 'No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto con MercadoPago para el procesamiento de pagos y cuando sea requerido por ley.', 3),
  ('privacidad', 'section_4', '4. Seguridad', 'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos: cifrado HTTPS en todas las comunicaciones, acceso restringido a la base de datos, y verificación de integridad en todas las transacciones.', 4),
  ('privacidad', 'section_5', '5. Tus derechos', 'Puedes solicitar acceso, rectificación o eliminación de tus datos personales en cualquier momento escribiendo a contacto@delotrolado.club.', 5),
  ('privacidad', 'section_6', '6. Cookies', 'Este sitio utiliza cookies esenciales para su funcionamiento (autenticación, sesión de compra). No utilizamos cookies de seguimiento ni publicidad de terceros.', 6);


insert into page_content (page_slug, section_key, title, body, sort_order) values
  ('terminos', 'section_1', '1. Compra de entradas', 'Al realizar una compra en delotrolado.club, aceptas estos términos. Las entradas son personales e intransferibles. Cada entrada incluye un código QR único que será verificado en la puerta del evento.', 1),
  ('terminos', 'section_2', '2. Política de reembolso', 'Las entradas no son reembolsables salvo en caso de cancelación total del evento por parte de delotrolado. En caso de cancelación, el reembolso se procesará automáticamente al medio de pago original dentro de un plazo de 10 días hábiles.', 2),
  ('terminos', 'section_3', '3. Acceso al evento', 'El organizador se reserva el derecho de admisión. El uso de cámaras profesionales, flash y grabación de video no está permitido sin autorización previa.', 3),
  ('terminos', 'section_4', '4. Responsabilidad', 'El asistente es responsable de sus pertenencias durante el evento. delotrolado no se hace responsable por pérdidas, daños o hurtos.', 4),
  ('terminos', 'section_5', '5. Cambios', 'delotrolado se reserva el derecho de modificar la fecha, horario, lineup o venue del evento. En caso de cambios significativos, se notificará a los compradores por email.', 5),
  ('terminos', 'section_6', '6. Contacto', 'Para cualquier consulta relacionada con tu compra, escribe a contacto@delotrolado.club con tu número de orden.', 6);


insert into artists (slug, name, role, bio, genres, sort_order, is_visible) values
  ('kra', 'KRA', 'resident', 'Residente del colectivo delotrolado. Sonidos oscuros, texturas industriales y grooves hipnóticos.', ARRAY['Techno', 'Industrial'], 1, true),
  ('muro', 'MURO', 'resident', 'Co-fundador de delotrolado. Techno duro, directo, sin filtros.', ARRAY['Techno', 'Hard Groove'], 2, true),
  ('sombra', 'SOMBRA', 'resident', 'La columna vertebral del colectivo. Sesiones largas, atmosféricas e implacables.', ARRAY['Dub Techno', 'Ambient'], 3, true),
  ('noise', 'NØISE', 'guest', 'Invitado internacional. Referente del circuito industrial europeo.', ARRAY['Industrial', 'EBM'], 4, true),
  ('vacio', 'VACÍO', 'guest', 'Artista invitado. Ambient oscuro y paisajes sonoros perturbadores.', ARRAY['Ambient', 'Experimental'], 5, true),
  ('frecuencia', 'FRECUENCIA', 'resident', 'Residente. Dub techno profundo y envolvente.', ARRAY['Dub Techno', 'Minimal'], 6, true),
  ('raw-material', 'RAW MATERIAL', 'live', 'Proyecto live. Síntesis modular en tiempo real, sin red.', ARRAY['Modular', 'Live'], 7, true),
  ('distorsion', 'DISTORSIÓN', 'guest', 'Invitado. Acid techno crudo y sin concesiones.', ARRAY['Acid', 'Techno'], 8, true)
on conflict (slug) do nothing;


insert into events (slug, name, description, date, doors_open, doors_close, venue, city, status, tags, min_age, is_featured) values
  ('noche-rota-vol-4', 'Noche Rota Vol. 4', 'Cuarta edición de nuestra fiesta insignia. Una noche de techno industrial sin cuartel en el corazón de Valparaíso. Espacio reducido, sonido envolvente, experiencia total.', '2026-04-12', '23:30', '07:00', 'Galpón Subterráneo', 'Valparaíso', 'published', ARRAY['Techno', 'Hard Groove'], 18, true),
  ('eclipse-total', 'Eclipse Total', 'Una noche donde la oscuridad es protagonista. Industrial, EBM y sonidos que desafían los límites del cuerpo.', '2026-04-26', '00:00', '08:00', 'Bodega Norte', 'Santiago', 'published', ARRAY['Industrial', 'EBM'], 18, false),
  ('ritual-sonoro-ii', 'Ritual Sonoro II', 'Segunda entrega de nuestra serie contemplativa. Dub techno, ambient y vibraciones profundas en un espacio íntimo.', '2026-05-10', '23:00', '06:00', 'Espacio Raw', 'Valparaíso', 'published', ARRAY['Dub Techno', 'Ambient'], 18, false),
  ('frecuencia-negra', 'Frecuencia Negra', 'Acid y techno en su estado más puro y visceral. Fecha por confirmar.', '2026-05-31', '23:30', '07:00', 'Centro Cultural Anónimo', 'Valparaíso', 'draft', ARRAY['Techno', 'Acid'], 18, false)
on conflict (slug) do nothing;


insert into event_artists (event_id, artist_id, set_time, set_end, set_type, is_headliner, sort_order)
select e.id, a.id, v.set_time, v.set_end, v.set_type, v.is_headliner, v.sort_order
from (values
  ('kra',          '23:30'::time, '01:00'::time, 'DJ Set', false, 1),
  ('muro',         '01:00'::time, '03:00'::time, 'DJ Set', false, 2),
  ('raw-material', '03:00'::time, '04:30'::time, 'Live',   true,  3),
  ('sombra',       '04:30'::time, '07:00'::time, 'DJ Set', false, 4)
) as v(artist_slug, set_time, set_end, set_type, is_headliner, sort_order)
join events e on e.slug = 'noche-rota-vol-4'
join artists a on a.slug = v.artist_slug
on conflict (event_id, artist_id) do nothing;


insert into event_artists (event_id, artist_id, set_time, set_end, set_type, is_headliner, sort_order)
select e.id, a.id, v.set_time, v.set_end, v.set_type, v.is_headliner, v.sort_order
from (values
  ('noise',       '00:00'::time, '02:00'::time, 'DJ Set', true,  1),
  ('distorsion',  '02:00'::time, '04:00'::time, 'DJ Set', false, 2),
  ('muro',        '04:00'::time, '06:00'::time, 'DJ Set', false, 3),
  ('vacio',       '06:00'::time, '08:00'::time, 'Live',   false, 4)
) as v(artist_slug, set_time, set_end, set_type, is_headliner, sort_order)
join events e on e.slug = 'eclipse-total'
join artists a on a.slug = v.artist_slug
on conflict (event_id, artist_id) do nothing;


insert into event_artists (event_id, artist_id, set_time, set_end, set_type, is_headliner, sort_order)
select e.id, a.id, v.set_time, v.set_end, v.set_type, v.is_headliner, v.sort_order
from (values
  ('frecuencia',   '23:00'::time, '01:30'::time, 'DJ Set', false, 1),
  ('vacio',        '01:30'::time, '03:30'::time, 'Live',   true,  2),
  ('sombra',       '03:30'::time, '06:00'::time, 'DJ Set', false, 3)
) as v(artist_slug, set_time, set_end, set_type, is_headliner, sort_order)
join events e on e.slug = 'ritual-sonoro-ii'
join artists a on a.slug = v.artist_slug
on conflict (event_id, artist_id) do nothing;


insert into ticket_types (event_id, name, description, price, stock, sold, is_active, sort_order)
select e.id, v.name, v.description, v.price, v.stock, v.sold, v.is_active, v.sort_order
from (values
  ('noche-rota-vol-4', 'Early Bird',  'Precio lanzamiento — cupo limitado',     5000,  50, 50, false, 1),
  ('noche-rota-vol-4', 'General',     'Entrada general anticipada',              8000, 100, 23, true,  2),
  ('noche-rota-vol-4', 'Puerta',      'Venta en puerta, sujeto a capacidad',   12000,   0,  0, true,  3),
  ('eclipse-total',    'Preventa',    'Precio anticipado',                       6000,  80, 12, true,  1),
  ('eclipse-total',    'General',     'Entrada general',                        10000, 120,  0, true,  2),
  ('ritual-sonoro-ii', 'Única',       'Entrada única — aforo reducido',          7000,  60,  0, true,  1)
) as v(event_slug, name, description, price, stock, sold, is_active, sort_order)
join events e on e.slug = v.event_slug;
