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
      className={`flex items-center justify-between py-0.5 ${!isOwn ? "cursor-pointer select-none" : ""} ${isPending ? "opacity-50" : ""}`}
    >
      <span className="text-xs text-gray-500">{member}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">{formatMoney(amount, currency)}</span>
        {isOwn ? (
          <span className="text-xs text-indigo-400">Payer</span>
        ) : paidBack ? (
          <span className="text-xs text-green-500">✓ Paid back</span>
        ) : (
          <span className="text-xs text-gray-300">○ Unpaid</span>
        )}
      </div>
    </div>
  );
}
