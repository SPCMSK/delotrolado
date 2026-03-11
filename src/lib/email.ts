import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "entradas@delotrolado.club";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY no configurado en .env.local");
  }
  return new Resend(apiKey);
}

/**
 * Fetch full order data (order + event + tickets + ticket types) from DB
 * and send the confirmation email with QR codes + event flyer.
 */
export async function sendOrderConfirmationEmail(orderId: string) {
  // 1. Fetch order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, email, name, phone, status, total, created_at, event_id")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    console.error("Email: order not found", orderId, orderErr);
    return { success: false, error: "Order not found" };
  }

  // 2. Fetch event
  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("id, name, slug, date, doors_open, doors_close, venue, address, city, flyer_url")
    .eq("id", order.event_id)
    .single();

  if (eventErr || !event) {
    console.error("Email: event not found", order.event_id, eventErr);
    return { success: false, error: "Event not found" };
  }

  // 3. Fetch tickets with ticket type names
  const { data: tickets, error: ticketsErr } = await supabase
    .from("tickets")
    .select("id, qr_code, ticket_type_id, ticket_types(name, price)")
    .eq("order_id", orderId);

  if (ticketsErr) {
    console.error("Email: tickets error", ticketsErr);
    return { success: false, error: "Tickets not found" };
  }

  const ticketList = (tickets ?? []).map((t) => ({
    qr_code: t.qr_code as string,
    type_name: Array.isArray(t.ticket_types)
      ? (t.ticket_types[0] as { name: string })?.name ?? "Entrada"
      : (t.ticket_types as { name: string } | null)?.name ?? "Entrada",
    price: Array.isArray(t.ticket_types)
      ? (t.ticket_types[0] as { price: number })?.price ?? 0
      : (t.ticket_types as { price: number } | null)?.price ?? 0,
  }));

  // 4. Fetch site settings for branding
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["site_name", "site_description"]);

  const siteName =
    settings?.find((s) => s.key === "site_name")?.value || "delotrolado";

  // 5. Format date
  const eventDate = new Date(event.date + "T00:00:00");
  const formattedDate = eventDate.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 6. Build base URL for assets
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://delotrolado.club";

  // 7. Build HTML
  const html = buildConfirmationHTML({
    siteName,
    buyerName: order.name,
    eventName: event.name,
    eventDate: formattedDate,
    doorsOpen: event.doors_open,
    doorsClose: event.doors_close,
    venue: event.venue,
    address: event.address,
    city: event.city,
    flyerUrl: event.flyer_url,
    tickets: ticketList,
    total: order.total,
    orderId: order.id,
    baseUrl,
  });

  // 8. Send via Resend
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: `${siteName} <${FROM_EMAIL}>`,
      to: order.email,
      subject: `🎫 Tus entradas para ${event.name} — ${siteName}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: "Send failed" };
  }
}

/* ─── HTML Template Builder ─── */

interface EmailData {
  siteName: string;
  buyerName: string;
  eventName: string;
  eventDate: string;
  doorsOpen: string | null;
  doorsClose: string | null;
  venue: string;
  address: string | null;
  city: string;
  flyerUrl: string | null;
  tickets: { qr_code: string; type_name: string; price: number }[];
  total: number;
  orderId: string;
  baseUrl: string;
}

function buildConfirmationHTML(data: EmailData): string {
  const {
    siteName,
    buyerName,
    eventName,
    eventDate,
    doorsOpen,
    doorsClose,
    venue,
    address,
    city,
    flyerUrl,
    tickets,
    total,
    orderId,
    baseUrl,
  } = data;

  // QR code via public API (Google Charts — no dependency needed)
  const qrUrl = (code: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}&bgcolor=0a0a0a&color=ffffff`;

  const doorsStr = doorsOpen
    ? `${doorsOpen.slice(0, 5)}${doorsClose ? ` — ${doorsClose.slice(0, 5)}` : ""} hrs`
    : "";

  const ticketRows = tickets
    .map(
      (t) => `
    <tr>
      <td style="padding:16px 0; border-bottom:1px solid #1a1a1a;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <img src="${qrUrl(t.qr_code)}" width="180" height="180" alt="QR ${t.qr_code}" style="display:block; border: 2px solid #222;" />
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="font-family:'Courier New',monospace; font-size:16px; font-weight:700; color:#64ff64; letter-spacing:0.1em;">
                ${escapeHtml(t.qr_code)}
              </span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:6px;">
              <span style="font-size:13px; color:#666;">
                ${escapeHtml(t.type_name)} · $${t.price.toLocaleString("es-CL")}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join("");

  // Flyer section — only if event has a flyer
  const flyerSection = flyerUrl
    ? `
    <tr>
      <td style="padding: 0 0 32px 0;">
        <img src="${escapeHtml(flyerUrl)}" width="540" alt="${escapeHtml(eventName)}" style="display:block; width:100%; max-width:540px; height:auto; border-radius:0;" />
      </td>
    </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Tus entradas — ${escapeHtml(siteName)}</title>
</head>
<body style="margin:0; padding:0; background-color:#050505; color:#e0e0e0; font-family:Arial,Helvetica,sans-serif; -webkit-text-size-adjust:100%;">

<!-- Wrapper -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#050505;">
  <tr>
    <td align="center" style="padding: 40px 16px;">

      <!-- Container 600px max -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; width:100%; background-color:#0a0a0a; border:1px solid #1a1a1a;">

        <!-- Header -->
        <tr>
          <td style="padding: 32px 40px; border-bottom: 1px solid #1a1a1a;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td>
                  <img src="${baseUrl}/LOGOS%20DOL%20SVG/2.svg" width="60" height="60" alt="${escapeHtml(siteName)}" style="display:block;" />
                </td>
                <td align="right" valign="middle">
                  <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.25em; color:#444;">
                    Confirmación de compra
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Flyer -->
        ${flyerSection}

        <!-- Greeting -->
        <tr>
          <td style="padding: 32px 40px 16px;">
            <h1 style="margin:0; font-size:24px; font-weight:700; text-transform:uppercase; letter-spacing:-0.02em; color:#fff;">
              ¡Compra confirmada!
            </h1>
            <p style="margin:12px 0 0; font-size:15px; color:#888; line-height:1.6;">
              Hola <strong style="color:#ccc;">${escapeHtml(buyerName)}</strong>, tus entradas para
              <strong style="color:#ccc;">${escapeHtml(eventName)}</strong> están listas.
            </p>
          </td>
        </tr>

        <!-- Event info -->
        <tr>
          <td style="padding: 16px 40px 24px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #1a1a1a;">
              <tr>
                <td style="padding: 24px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding-bottom:12px;">
                        <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.25em; color:#555;">Evento</span><br />
                        <span style="font-size:16px; font-weight:600; color:#fff;">${escapeHtml(eventName)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:12px;">
                        <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.25em; color:#555;">Fecha</span><br />
                        <span style="font-size:14px; color:#ccc;">${escapeHtml(formattedDateCapitalize(eventDate))}</span>
                      </td>
                    </tr>
                    ${doorsStr ? `
                    <tr>
                      <td style="padding-bottom:12px;">
                        <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.25em; color:#555;">Horario</span><br />
                        <span style="font-size:14px; color:#ccc;">${escapeHtml(doorsStr)}</span>
                      </td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding-bottom:12px;">
                        <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.25em; color:#555;">Lugar</span><br />
                        <span style="font-size:14px; color:#ccc;">${escapeHtml(venue)}${address ? ` · ${escapeHtml(address)}` : ""}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.25em; color:#555;">Ciudad</span><br />
                        <span style="font-size:14px; color:#ccc;">${escapeHtml(city)}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Important notice -->
        <tr>
          <td style="padding: 0 40px 24px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#111; border-left:3px solid #64ff64;">
              <tr>
                <td style="padding: 16px 20px;">
                  <span style="font-size:13px; color:#aaa; line-height:1.6;">
                    <strong style="color:#64ff64;">Importante:</strong> Presentá el código QR de cada entrada en la puerta del evento. Cada QR es de uso único.
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Tickets / QR Codes -->
        <tr>
          <td style="padding: 0 40px 32px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:16px;">
                  <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.25em; color:#555;">Tus entradas</span>
                </td>
              </tr>
              ${ticketRows}
            </table>
          </td>
        </tr>

        <!-- Total -->
        <tr>
          <td style="padding: 0 40px 32px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #1a1a1a;">
              <tr>
                <td style="padding-top:16px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="font-size:14px; color:#888;">Total pagado</td>
                      <td align="right" style="font-size:20px; font-weight:700; color:#fff;">
                        $${total.toLocaleString("es-CL")}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:6px; font-size:11px; color:#444;">
                        Orden: ${escapeHtml(orderId)}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 40px; border-top:1px solid #1a1a1a; text-align:center;">
            <p style="margin:0; font-size:11px; color:#444; line-height:1.6;">
              ${escapeHtml(siteName)} · Valparaíso, Chile<br />
              <a href="${baseUrl}" style="color:#666; text-decoration:underline;">${escapeHtml(siteName)}.club</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- /Container -->

    </td>
  </tr>
</table>

</body>
</html>`;
}

/* ─── Helpers ─── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formattedDateCapitalize(date: string): string {
  return date.charAt(0).toUpperCase() + date.slice(1);
}
