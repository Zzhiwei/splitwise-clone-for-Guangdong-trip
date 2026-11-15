export const MEMBERS = ["Fangbing", "Gabriella", "Ignatius", "Souwmyaa", "Zhiwei"] as const;

export const TRIP_NAME = "Vietnam Trip";

// All stored amounts (Expense.amount, Split.amount) are in the base currency.
export const BASE_CURRENCY = "VND";
export const CURRENCIES = ["VND", "SGD"] as const;
export type Currency = (typeof CURRENCIES)[number];

// Fallback until the first SGD expense sets the rate; editable on the add form.
export const DEFAULT_SGD_TO_VND = 19500;
