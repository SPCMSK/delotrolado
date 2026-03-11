import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";

function getClient() {
  if (!ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN no configurado en .env.local");
  }
  return new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
}

export function createPreferenceClient() {
  return new Preference(getClient());
}

export function createPaymentClient() {
  return new Payment(getClient());
}

export const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || "";
