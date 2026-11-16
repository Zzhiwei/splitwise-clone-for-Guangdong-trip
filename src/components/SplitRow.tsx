"use client";

import { toggleSplitPaidBack } from "@/lib/actions";
import { useTransition } from "react";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/constants";

interface Props {
  splitId: string;
  member: string;
  amount: number;
  paidBack: boolean;
  paidBy: string;
  currency: Currency;
}

export default function SplitRow({ splitId, member, amount, paidBack, paidBy, currency }: Props) {
  const [isPending, startTransition] = useTransition();
  const isOwn = member === paidBy;

  function handleToggle() {
    if (isOwn) return;
    startTransition(() => toggleSplitPaidBack(splitId, !paidBack));
  }

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center gap-2 min-h-[40px] ${!isOwn ? "cursor-pointer select-none" : ""} ${isPending ? "opacity-50" : ""}`}
    >
      <span className="flex-1 min-w-0 truncate text-sm text-gray-600">{member}</span>
      <span className="text-sm text-gray-500 whitespace-nowrap">{formatMoney(amount, currency)}</span>
      <span className="w-24 text-right text-xs whitespace-nowrap">
        {isOwn ? (
          <span className="text-indigo-400">Payer</span>
        ) : paidBack ? (
          <span className="text-green-500">✓ Paid back</span>
        ) : (
          <span className="text-gray-400">○ Unpaid</span>
        )}
      </span>
    </div>
  );
}
