"use client";

import { useTransition } from "react";
import { setDisplayCurrency } from "@/lib/actions";
import { CURRENCIES, type Currency } from "@/lib/constants";

export default function CurrencyToggle({ current }: { current: Currency }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex rounded-md overflow-hidden border border-gray-200 ${isPending ? "opacity-50" : ""}`}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => setDisplayCurrency(c))}
          className={`px-2 py-1 text-xs font-medium ${
            current === c ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
