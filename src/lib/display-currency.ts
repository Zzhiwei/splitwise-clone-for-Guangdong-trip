import { cookies } from "next/headers";
import { parseCurrency } from "./currency";
import type { Currency } from "./constants";

export const DISPLAY_CURRENCY_COOKIE = "splitwize_currency";

// Per-browser display currency; defaults to BASE_CURRENCY when unset or invalid.
export function getDisplayCurrency(): Currency {
  return parseCurrency(cookies().get(DISPLAY_CURRENCY_COOKIE)?.value);
}
