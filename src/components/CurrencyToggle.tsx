"use client";

import { useTransition } from "react";
import { setDisplayCurrency } from "@/lib/actions";
import { CURRENCIES, type Currency } from "@/lib/constants";

export default function CurrencyToggle({ current }: { current: Currency }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex rounded-md overflow-hidden border border-hairline ${isPending ? "opacity-50" : ""}`}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => setDisplayCurrency(c))}
          className={`px-4 py-2 text-sm font-medium ${
            current === c ? "bg-primary text-ink font-semibold" : "bg-card text-body hover:bg-elevated"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
