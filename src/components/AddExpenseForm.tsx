"use client";

import { useState, useTransition } from "react";
import { addExpense } from "@/lib/actions";
import { MEMBERS, BASE_CURRENCY, CURRENCIES, TRIP_NAME, type Currency } from "@/lib/constants";
import { formatVnd } from "@/lib/format";

type SplitType = "equal" | "percentage" | "exact";

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function AddExpenseForm({ defaultRate }: { defaultRate: number }) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(BASE_CURRENCY);
  const [rate, setRate] = useState(String(defaultRate));
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [included, setIncluded] = useState<Record<string, boolean>>(
    Object.fromEntries(MEMBERS.map((m) => [m, true]))
  );
  const [percentages, setPercentages] = useState<Record<string, string>>(
    Object.fromEntries(MEMBERS.map((m) => [m, String(100 / MEMBERS.length)]))
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(
    Object.fromEntries(MEMBERS.map((m) => [m, ""]))
  );
  const [isPending, startTransition] = useTransition();

  const isForeign = currency !== BASE_CURRENCY;
  const factor = isForeign ? parseFloat(rate) || 0 : 1;
  const enteredTotalRaw = parseFloat(amount) || 0;
  const totalBase = round2(enteredTotalRaw * factor);

  function computeSplits() {
    const activeMembers = MEMBERS.filter((m) => included[m]);
    const total = totalBase;

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

    // Exact amounts are typed in the chosen currency; convert, then absorb rounding in the last split.
    const converted = activeMembers.map((m) => ({
      member: m,
      amount: round2((parseFloat(exactAmounts[m]) || 0) * factor),
    }));
    if (converted.length > 0 && Math.abs(exactSum - enteredTotal) < 0.02) {
      const others = converted.slice(0, -1).reduce((s, x) => s + x.amount, 0);
      converted[converted.length - 1].amount = round2(total - others);
    }
    return converted;
  }

  function handleSubmit(formData: FormData) {
    const splits = computeSplits();
    formData.set("splits", JSON.stringify(splits));
    // Store VND; keep what was actually entered for the audit trail.
    formData.set("currency", currency);
    formData.set("originalAmount", String(enteredTotal));
    formData.set("fxRate", String(factor));
    formData.set("amount", String(totalBase));
    startTransition(() => addExpense(formData));
  }

  const today = new Date().toISOString().split("T")[0];
  const activeMembers = MEMBERS.filter((m) => included[m]);
  const enteredTotal = enteredTotalRaw;
  const total = enteredTotal; // in the chosen currency; used for display and exact-sum check

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
      <h1 className="text-2xl font-bold text-gray-900">Add expense · {TRIP_NAME}</h1>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            name="title"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Pho in Hanoi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ({currency})
          </label>
          <div className="flex gap-2 mb-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  currency === c
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
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
          {isForeign && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span>1 {currency} =</span>
              <input
                type="number"
                step="any"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-28 border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <span>{BASE_CURRENCY}</span>
              {totalBase > 0 && <span className="text-gray-400">≈ {formatVnd(totalBase)}</span>}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid by
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
            Split method
          </label>
          <input type="hidden" name="splitType" value={splitType} />
          <div className="flex gap-2">
            {(["equal", "percentage", "exact"] as SplitType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSplitType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  splitType === t
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t === "equal" ? "Equal" : t === "percentage" ? "By percentage" : "Custom"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Participants
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
                    <span className="text-sm text-gray-500">{currency}</span>
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
                    {currency}{" "}
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
              Total: {exactSum.toFixed(2)} / {total.toFixed(2)} {currency}{" "}
              {Math.abs(exactSum - total) < 0.02 ? "✓" : "(must equal the total)"}
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
          {isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
