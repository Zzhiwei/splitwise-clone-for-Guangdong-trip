"use client";

import { toggleSplitPaidBack } from "@/lib/actions";
import { useTransition } from "react";
import { formatVnd } from "@/lib/format";

interface Props {
  splitId: string;
  member: string;
  amount: number;
  paidBack: boolean;
  paidBy: string;
}

export default function SplitRow({ splitId, member, amount, paidBack, paidBy }: Props) {
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
        <span className="text-xs text-gray-400">{formatVnd(amount)}</span>
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
