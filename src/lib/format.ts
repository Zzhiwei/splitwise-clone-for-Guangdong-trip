import type { Currency } from "./constants";

// VND has no minor unit: whole đồng with thousands separators. SGD shows 2 decimals.
export function formatMoney(n: number, currency: Currency): string {
  const digits = currency === "VND" ? 0 : 2;
  const factor = 10 ** digits;
  const r = Math.round(Math.abs(n) * factor) / factor;
  const symbol = currency === "VND" ? "₫" : "S$";
  const body = r.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return `${n < 0 && r > 0 ? "-" : ""}${symbol}${body}`;
}
