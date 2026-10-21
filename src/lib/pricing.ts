export const FREE_SHIPPING_FROM = 100;
export const SHIPPING_FEE = 10;
export const MAX_PER_ITEM = 10;

export interface PricedItem {
  price: number;
  discountPercentage: number;
  quantity: number;
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function finalPrice(price: number, discountPercentage: number): number {
  return round(price * (1 - discountPercentage / 100));
}

export function cartTotals(items: PricedItem[]) {
  const original = round(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const subtotal = round(items.reduce((sum, item) => sum + finalPrice(item.price, item.discountPercentage) * item.quantity, 0));
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { original, savings: round(original - subtotal), subtotal, shipping, total: round(subtotal + shipping), count };
}

export function maxQuantity(stock: number): number {
  return Math.max(0, Math.min(stock, MAX_PER_ITEM));
}

export function stockLevel(stock: number): "out" | "low" | "in" {
  if (stock <= 0) return "out";
  if (stock < 10) return "low";
  return "in";
}
