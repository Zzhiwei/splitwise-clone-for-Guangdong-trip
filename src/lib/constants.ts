export const MEMBERS = ["Fangbing", "Gabriella", "Ignatius", "Souwmyaa", "Zhiwei"] as const;

export const TRIP_NAME = "Vietnam Trip";

// Default display/entry currency. Expense.amount and Split.amount are stored in each expense's own currency.
export const BASE_CURRENCY = "VND";
export const CURRENCIES = ["VND", "SGD"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Fallback until someone sets the rate; editable on the home page.
export const DEFAULT_SGD_TO_VND = 19500;
