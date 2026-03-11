import { getOrders, updateOrderStatus } from "@/lib/admin-actions";
import { OrdersPanel } from "./orders-panel";

export default async function VentasPage() {
  const orders = await getOrders() as {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    status: string;
    total: number;
    mp_payment_id: string | null;
    created_at: string;
    event?: { name: string; slug: string } | null;
  }[];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Ventas</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
            {orders.length} {orders.length === 1 ? "orden" : "órdenes"}
          </p>
        </div>
      </div>

      <OrdersPanel orders={orders} updateOrderStatus={updateOrderStatus} />
    </div>
  );
}
