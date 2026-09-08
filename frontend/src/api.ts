export const API = process.env.EXPO_PUBLIC_BACKEND_URL + "/api";

export async function api<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(`API ${path} ${r.status}`);
  return r.json();
}

export type Category = { id: string; name: string; emoji: string; color: string };
export type DiscoverChip = { id: string; label: string; emoji: string; color: string };
export type Banner = { id: string; title: string; subtitle: string; image: string; bg: string };
export type Product = {
  id: string; name: string; weight: string; price: number; mrp: number;
  image: string; category_id: string; store_id: string;
  delivery_min: number; discount_pct?: number | null; rating: number;
};
export type StoreMedia = { type: "video" | "image"; url: string; thumbnail?: string };
export type Store = {
  id: string; name: string; logo: string; tagline: string;
  delivery_time: string; rating: number; tags: string[]; media: StoreMedia[];
};

export type Coupon = {
  code: string; label: string; kind: "flat" | "pct"; value: number;
  min_order: number; description: string;
};

export type CouponResult = {
  ok: boolean; discount: number; coupon?: Coupon | null; message: string;
};

export type OrderItem = {
  id: string; name: string; weight: string; price: number; mrp: number; image: string; qty: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  coupon_code?: string | null;
  status: string;
  rider_name: string;
  rider_phone: string;
  eta_minutes: number;
  created_at: string;
};

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API ${path} ${r.status}`);
  return r.json();
}
