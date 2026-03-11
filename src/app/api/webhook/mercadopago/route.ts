import { NextRequest, NextResponse } from "next/server";
import { createPaymentClient } from "@/lib/mercadopago";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MercadoPago sends different notification types
    if (body.type !== "payment" && body.action !== "payment.updated") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    // Fetch payment details from MercadoPago
    let payment;
    try {
      const paymentClient = createPaymentClient();
      payment = await paymentClient.get({ id: paymentId });
    } catch (mpErr) {
      console.error("Error fetching MP payment:", mpErr);
      return NextResponse.json({ error: "MP API error" }, { status: 500 });
    }

    if (!payment?.external_reference) {
      return NextResponse.json({ ok: true });
    }

    const orderId = payment.external_reference;
    const mpStatus = payment.status; // approved, rejected, pending, etc.

    // Map MP status to our order status
    let orderStatus: string;
    switch (mpStatus) {
      case "approved":
        orderStatus = "approved";
        break;
      case "rejected":
      case "cancelled":
        orderStatus = "rejected";
        break;
      case "refunded":
        orderStatus = "refunded";
        break;
      default:
        orderStatus = "pending";
    }

    // Update order
    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        mp_payment_id: String(paymentId),
      })
      .eq("id", orderId);

    if (orderErr) {
      console.error("Error updating order:", orderErr);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // If approved, update sold counts on ticket_types + send email
    if (orderStatus === "approved") {
      const { data: tickets } = await supabase
        .from("tickets")
        .select("ticket_type_id")
        .eq("order_id", orderId);

      if (tickets) {
        // Count quantities per ticket type
        const counts: Record<string, number> = {};
        for (const t of tickets) {
          counts[t.ticket_type_id] = (counts[t.ticket_type_id] || 0) + 1;
        }

        // Increment sold for each type
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

      // Send confirmation email with QR codes
      const emailResult = await sendOrderConfirmationEmail(orderId);
      if (!emailResult.success) {
        console.error("Failed to send confirmation email:", emailResult.error);
      }
    }

    // If rejected, clean up tickets and order
    if (orderStatus === "rejected") {
      await supabase.from("tickets").delete().eq("order_id", orderId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
