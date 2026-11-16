import { CURRENCIES, BASE_CURRENCY, type Currency } from "./constants";

// VND per 1 unit of each currency. SGD comes from the global rate setting.
function vndPerUnit(c: Currency, sgdToVnd: number): number {
  return c === "SGD" ? sgdToVnd : 1;
}

// Not rounded: balance.ts rounds the net once, and formatMoney rounds for display.
export function convert(amount: number, from: Currency, to: Currency, sgdToVnd: number): number {
  if (from === to) return amount;
  return (amount * vndPerUnit(from, sgdToVnd)) / vndPerUnit(to, sgdToVnd);
}

export function parseCurrency(v: string | undefined): Currency {
  return CURRENCIES.find((c) => c === v) ?? BASE_CURRENCY;
}

type Convertible = {
  amount: number;
  currency: string;
  splits: { amount: number }[];
};

export type Converted<E extends Convertible> = E & {
  sourceCurrency: string;
  sourceAmount: number;
};

// Converts amounts to `to` (before balance calculation); keeps the entered values as source*.
export function convertExpenses<E extends Convertible>(
  expenses: E[],
  to: Currency,
  sgdToVnd: number
): Converted<E>[] {
  return expenses.map((e) => {
    const from = parseCurrency(e.currency);
    return {
      ...e,
      currency: to,
      amount: convert(e.amount, from, to, sgdToVnd),
      splits: e.splits.map((s) => ({ ...s, amount: convert(s.amount, from, to, sgdToVnd) })),
      sourceCurrency: e.currency,
      sourceAmount: e.amount,
    };
  });
}
