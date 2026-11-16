"use client";

import { useState, useTransition } from "react";
import { setFxRate } from "@/lib/actions";

export default function FxRateEditor({ rate }: { rate: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(rate));
  const [isPending, startTransition] = useTransition();

  function save() {
    const n = parseFloat(value);
    if (!(n > 0)) return;
    startTransition(async () => {
      await setFxRate(n);
      setEditing(false);
    });
  }

  return (
    <div className="bg-card rounded-3xl border border-hairline px-4 py-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-body">
      <span className="font-medium whitespace-nowrap">FX rate</span>
      {editing ? (
        <>
          <span className="whitespace-nowrap">1 SGD =</span>
          <input
            type="number"
            step="any"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24 bg-card border border-ink text-ink rounded-lg px-2 py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary text-base"
          />
          <span className="whitespace-nowrap">VND</span>
          <button
            onClick={save}
            disabled={isPending}
            className="ml-auto min-h-[44px] px-2 text-ink underline underline-offset-4 font-medium disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setValue(String(rate));
              setEditing(false);
            }}
            className="min-h-[44px] px-2 text-muted"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="tabular-nums whitespace-nowrap">1 SGD = {rate.toLocaleString("en-US")} VND</span>
          <button
            onClick={() => setEditing(true)}
            className="ml-auto min-h-[44px] px-2 text-ink underline underline-offset-4 font-medium"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}
