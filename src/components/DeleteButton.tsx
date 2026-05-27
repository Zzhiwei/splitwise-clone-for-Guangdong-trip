"use client";

import { deleteExpense } from "@/lib/actions";
import { useTransition } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => deleteExpense(id))}
      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
    >
      {isPending ? "..." : "Delete"}
    </button>
  );
}
