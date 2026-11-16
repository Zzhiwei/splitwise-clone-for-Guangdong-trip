"use client";

import { resolveExpense } from "@/lib/actions";
import { useState, useTransition } from "react";

export default function ResolveButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => resolveExpense(id));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="min-h-[44px] px-3 text-sm font-medium text-primary hover:opacity-80"
      >
        Resolve
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-card rounded-xl border border-hairline p-6 w-72 max-w-[calc(100vw-2rem)] space-y-4">
            <p className="text-sm font-medium text-white">Mark this expense as resolved?</p>
            <p className="text-xs text-muted">It will be removed from the active list.</p>
            <p className="text-xs text-muted">All splits will also be marked as paid back.</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirm(false)}
                className="text-sm px-4 py-2.5 rounded-md border border-hairline text-body hover:bg-elevated disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirm}
                className="text-sm px-4 py-2.5 rounded-md bg-primary text-ink font-semibold hover:bg-primary-active disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {isPending ? "Resolving…" : "Confirm resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
