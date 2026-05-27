"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [5, 10, 20, "all"] as const;
type Option = (typeof OPTIONS)[number];

export default function RecentLimitPicker({ current }: { current: Option }) {
  const router = useRouter();
  const params = useSearchParams();

  function select(value: Option) {
    const next = new URLSearchParams(params.toString());
    next.set("show", String(value));
    router.push(`/?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => select(opt)}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
            current === opt
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {opt === "all" ? "All" : opt}
        </button>
      ))}
    </div>
  );
}
