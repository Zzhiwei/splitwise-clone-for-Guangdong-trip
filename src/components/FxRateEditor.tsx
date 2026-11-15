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
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-2 text-sm text-gray-700">
      <span className="font-medium">FX rate</span>
      {editing ? (
        <>
          <span>1 SGD =</span>
          <input
            type="number"
            step="any"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <span>VND</span>
          <button
            onClick={save}
            disabled={isPending}
            className="ml-auto text-indigo-600 font-medium disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setValue(String(rate));
              setEditing(false);
            }}
            className="text-gray-500"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span>1 SGD = {rate.toLocaleString("en-US")} VND</span>
          <button
            onClick={() => setEditing(true)}
            className="ml-auto text-indigo-600 font-medium"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
}
