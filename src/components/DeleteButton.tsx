"use client";

import { deleteExpense } from "@/lib/actions";
import { useState, useTransition } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => deleteExpense(id));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="min-h-[44px] px-3 text-sm font-medium text-down hover:opacity-80"
      >
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60">
          <div className="bg-card rounded-3xl border border-hairline p-6 w-72 max-w-[calc(100vw-2rem)] space-y-4">
            <p className="text-sm font-medium text-ink">Delete this expense?</p>
            <p className="text-xs text-muted">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirm(false)}
                className="text-sm px-4 py-2.5 rounded-3xl border border-ink text-ink hover:bg-elevated disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirm}
                className="text-sm px-4 py-2.5 rounded-3xl bg-down text-white font-semibold hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {isPending ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
