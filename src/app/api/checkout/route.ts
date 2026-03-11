import { NextRequest, NextResponse } from "next/server";
import { createPreferenceClient } from "@/lib/mercadopago";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import crypto from "crypto";

interface CartItem {
  ticket_type_id: string;
  quantity: number;
}

interface CheckoutBody {
  event_id: string;
  event_slug: string;
  items: CartItem[];
  buyer: {
    name: string;
    email: string;
    phone?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();

    // Validate required fields
    if (!body.event_id || !body.items?.length || !body.buyer?.name || !body.buyer?.email) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.buyer.email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validate quantities
    if (body.items.some(i => i.quantity < 1 || i.quantity > 10)) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }

    // Fetch event
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, name, slug, status, is_past")
      .eq("id", body.event_id)
      .eq("status", "published")
      .single();

    if (eventErr || !event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    if (event.is_past) {
      return NextResponse.json({ error: "Las entradas para este evento ya no están disponibles" }, { status: 400 });
    }

    // Fetch and validate ticket types + stock
    const ticketTypeIds = body.items.map(i => i.ticket_type_id);
    const { data: ticketTypes, error: ttErr } = await supabase
      .from("ticket_types")
      .select("*")
      .in("id", ticketTypeIds)
      .eq("event_id", body.event_id)
      .eq("is_active", true);

    if (ttErr || !ticketTypes) {
      return NextResponse.json({ error: "Error al obtener tipos de entrada" }, { status: 500 });
    }

    // Build items & compute total
    let total = 0;
    const preferenceItems: { id: string; title: string; quantity: number; unit_price: number; currency_id: string }[] = [];

    for (const cartItem of body.items) {
      const tt = ticketTypes.find(t => t.id === cartItem.ticket_type_id);
      if (!tt) {
        return NextResponse.json({ error: `Tipo de entrada no encontrado` }, { status: 400 });
      }
      if (cartItem.quantity > tt.max_per_order) {
        return NextResponse.json({ error: `Máximo ${tt.max_per_order} entradas de tipo ${tt.name}` }, { status: 400 });
      }
      const available = tt.stock - tt.sold;
      if (available < cartItem.quantity) {
        return NextResponse.json({ error: `No hay suficiente stock para ${tt.name}` }, { status: 400 });
      }
      total += tt.price * cartItem.quantity;
      preferenceItems.push({
        id: tt.id,
        title: `${event.name} — ${tt.name}`,
        quantity: cartItem.quantity,
        unit_price: tt.price,
        currency_id: "CLP",
      });
    }

    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID();

    // Create order in DB (status: pending)
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        event_id: body.event_id,
        email: body.buyer.email.trim().toLowerCase(),
        name: body.buyer.name.trim(),
        phone: body.buyer.phone?.trim() || null,
        status: "pending",
        total,
        idempotency_key: idempotencyKey,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("Error creating order:", orderErr);
      return NextResponse.json({ error: "Error al crear la orden" }, { status: 500 });
    }

    // Store cart items in order metadata (we'll use them when confirming)
    // Save as order_items in a separate approach: store in the idempotency key pattern
    // For now, create pending tickets with QR codes
    const ticketInserts: { order_id: string; ticket_type_id: string; qr_code: string }[] = [];
    for (const cartItem of body.items) {
      for (let i = 0; i < cartItem.quantity; i++) {
        ticketInserts.push({
          order_id: order.id,
          ticket_type_id: cartItem.ticket_type_id,
          qr_code: `DOL-${crypto.randomUUID().split("-")[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        });
      }
    }

    const { error: ticketsErr } = await supabase
      .from("tickets")
      .insert(ticketInserts);

    if (ticketsErr) {
      console.error("Error creating tickets:", ticketsErr);
      // Clean up order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Error al reservar entradas" }, { status: 500 });
    }

    // Create MercadoPago preference
    try {
      const preference = createPreferenceClient();
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://delotrolado.club";

      const mpPref = await preference.create({
        body: {
          items: preferenceItems,
          payer: {
            name: body.buyer.name,
            email: body.buyer.email,
          },
          back_urls: {
            success: `${baseUrl}/eventos/${body.event_slug}/confirmacion?order=${order.id}`,
            failure: `${baseUrl}/eventos/${body.event_slug}/checkout?error=payment_failed`,
            pending: `${baseUrl}/eventos/${body.event_slug}/confirmacion?order=${order.id}&pending=1`,
          },
          auto_return: "approved",
          external_reference: order.id,
          notification_url: `${baseUrl}/api/webhook/mercadopago`,
          statement_descriptor: "DELOTROLADO",
        },
      });

      // Update order with MP preference ID
      await supabase
        .from("orders")
        .update({ mp_preference_id: mpPref.id })
        .eq("id", order.id);

      return NextResponse.json({
        init_point: mpPref.init_point,
        order_id: order.id,
      });
    } catch (mpError) {
      console.error("MercadoPago error:", mpError);
      // MP not configured — send email in dev mode and return order ID
      const emailResult = await sendOrderConfirmationEmail(order.id);
      if (!emailResult.success) {
        console.error("Dev email failed:", emailResult.error);
      }
      return NextResponse.json({
        init_point: null,
        order_id: order.id,
        mp_not_configured: true,
      });
    }
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
