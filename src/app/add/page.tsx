"use client";

import { useState, useTransition } from "react";
import { addExpense } from "@/lib/actions";
import { MEMBERS } from "@/lib/constants";

type SplitType = "equal" | "percentage" | "exact";

export default function AddExpensePage() {
  const [amount, setAmount] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [included, setIncluded] = useState<Record<string, boolean>>(
    Object.fromEntries(MEMBERS.map((m) => [m, true]))
  );
  const [percentages, setPercentages] = useState<Record<string, string>>(
    Object.fromEntries(MEMBERS.map((m) => [m, "25"]))
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(
    Object.fromEntries(MEMBERS.map((m) => [m, ""]))
  );
  const [isPending, startTransition] = useTransition();

  function computeSplits() {
    const total = parseFloat(amount) || 0;
    const activeMembers = MEMBERS.filter((m) => included[m]);

    if (splitType === "equal") {
      const share = Math.round((total / activeMembers.length) * 100) / 100;
      const lastShare =
        Math.round((total - share * (activeMembers.length - 1)) * 100) / 100;
      return activeMembers.map((m, i) => ({
        member: m,
        amount: i === activeMembers.length - 1 ? lastShare : share,
      }));
    }

    if (splitType === "percentage") {
      return activeMembers.map((m) => ({
        member: m,
        amount:
          Math.round(((parseFloat(percentages[m]) || 0) / 100) * total * 100) /
          100,
      }));
    }

    return activeMembers.map((m) => ({
      member: m,
      amount: parseFloat(exactAmounts[m]) || 0,
    }));
  }

  function handleSubmit(formData: FormData) {
    const splits = computeSplits();
    formData.set("splits", JSON.stringify(splits));
    startTransition(() => addExpense(formData));
  }

  const today = new Date().toISOString().split("T")[0];
  const activeMembers = MEMBERS.filter((m) => included[m]);
  const total = parseFloat(amount) || 0;

  const percentageSum = activeMembers.reduce(
    (s, m) => s + (parseFloat(percentages[m]) || 0),
    0
  );
  const exactSum = activeMembers.reduce(
    (s, m) => s + (parseFloat(exactAmounts[m]) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            name="title"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Dinner at Canton Tower"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (¥)
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>
          <select
            name="paidBy"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {MEMBERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Type
          </label>
          <input type="hidden" name="splitType" value={splitType} />
          <div className="flex gap-2">
            {(["equal", "percentage", "exact"] as SplitType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSplitType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  splitType === t
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Between
          </label>
          <div className="space-y-2">
            {MEMBERS.map((m) => (
              <div key={m} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`member-${m}`}
                  checked={included[m]}
                  onChange={(e) =>
                    setIncluded((prev) => ({ ...prev, [m]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <label
                  htmlFor={`member-${m}`}
                  className="text-sm text-gray-700 w-20"
                >
                  {m}
                </label>

                {splitType === "percentage" && included[m] && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={percentages[m]}
                      onChange={(e) =>
                        setPercentages((prev) => ({
                          ...prev,
                          [m]: e.target.value,
                        }))
                      }
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                )}

                {splitType === "exact" && included[m] && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">¥</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={exactAmounts[m]}
                      onChange={(e) =>
                        setExactAmounts((prev) => ({
                          ...prev,
                          [m]: e.target.value,
                        }))
                      }
                      className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {splitType === "equal" && included[m] && total > 0 && (
                  <span className="text-sm text-gray-400">
                    ¥
                    {(
                      Math.round((total / activeMembers.length) * 100) / 100
                    ).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {splitType === "percentage" && activeMembers.length > 0 && (
            <p
              className={`mt-2 text-xs ${
                Math.abs(percentageSum - 100) < 0.1
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              Total: {percentageSum.toFixed(1)}% {Math.abs(percentageSum - 100) < 0.1 ? "✓" : "(must equal 100%)"}
            </p>
          )}

          {splitType === "exact" && activeMembers.length > 0 && total > 0 && (
            <p
              className={`mt-2 text-xs ${
                Math.abs(exactSum - total) < 0.02
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              Total: ¥{exactSum.toFixed(2)} / ¥{total.toFixed(2)}{" "}
              {Math.abs(exactSum - total) < 0.02 ? "✓" : "(must equal expense amount)"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {isPending ? "Saving…" : "Save Expense"}
        </button>
      </form>
    </div>
  );
}
