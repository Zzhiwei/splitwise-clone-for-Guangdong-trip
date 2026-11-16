"use client";

import { useState, useTransition } from "react";
import { addExpense, updateExpense } from "@/lib/actions";
import { MEMBERS, CURRENCIES, TRIP_NAME, type Currency } from "@/lib/constants";

type SplitType = "equal" | "percentage" | "exact";

const round2 = (n: number) => Math.round(n * 100) / 100;

// Existing expense to edit; amounts are in its own currency, as stored.
export interface EditableExpense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string; // YYYY-MM-DD
  splitType: string;
  currency: Currency;
  splits: { member: string; amount: number }[];
}

export default function AddExpenseForm({
  defaultCurrency,
  expense,
}: {
  defaultCurrency: Currency;
  expense?: EditableExpense;
}) {
  const splitOf = (m: string) => expense?.splits.find((s) => s.member === m);
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [currency, setCurrency] = useState<Currency>(expense?.currency ?? defaultCurrency);
  const [splitType, setSplitType] = useState<SplitType>((expense?.splitType as SplitType) ?? "equal");
  const [included, setIncluded] = useState<Record<string, boolean>>(
    Object.fromEntries(MEMBERS.map((m) => [m, expense ? !!splitOf(m) : true]))
  );
  const [percentages, setPercentages] = useState<Record<string, string>>(
    Object.fromEntries(
      MEMBERS.map((m) => {
        const sp = splitOf(m);
        return [m, String(sp && expense ? round2((sp.amount / expense.amount) * 100) : 100 / MEMBERS.length)];
      })
    )
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(
    Object.fromEntries(MEMBERS.map((m) => [m, expense ? String(splitOf(m)?.amount ?? "") : ""]))
  );
  const [isPending, startTransition] = useTransition();

  const total = parseFloat(amount) || 0; // in the chosen currency; stored as entered

  function computeSplits() {
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

    // Exact amounts are typed in the chosen currency; the last split absorbs rounding.
    const exact = activeMembers.map((m) => ({
      member: m,
      amount: round2(parseFloat(exactAmounts[m]) || 0),
    }));
    if (exact.length > 0 && Math.abs(exactSum - total) < 0.02) {
      const others = exact.slice(0, -1).reduce((s, x) => s + x.amount, 0);
      exact[exact.length - 1].amount = round2(total - others);
    }
    return exact;
  }

  function handleSubmit(formData: FormData) {
    const splits = computeSplits();
    formData.set("splits", JSON.stringify(splits));
    formData.set("currency", currency);
    formData.set("amount", String(round2(total)));
    startTransition(() => (expense ? updateExpense(expense.id, formData) : addExpense(formData)));
  }

  const today = expense?.date ?? new Date().toISOString().split("T")[0];
  const activeMembers = MEMBERS.filter((m) => included[m]);

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
      <h1 className="text-3xl font-black text-ink tracking-tight">{expense ? "Edit expense" : "Add expense"} · {TRIP_NAME}</h1>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-body mb-1">
            Description
          </label>
          <input
            name="title"
            required
            defaultValue={expense?.title}
            className="w-full bg-card border border-ink text-ink placeholder:text-muted rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-ink"
            placeholder="e.g. Pho in Hanoi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-1">
            Amount ({currency})
          </label>
          <div className="flex gap-2 mb-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium ${
                  currency === c
                    ? "bg-primary text-ink font-semibold"
                    : "bg-card text-ink hover:bg-primary-pale"
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
            className="w-full bg-card border border-ink text-ink placeholder:text-muted rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-ink"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-1">
            Paid by
          </label>
          <select
            name="paidBy"
            required
            defaultValue={expense?.paidBy}
            className="w-full bg-card border border-ink text-ink placeholder:text-muted rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-ink"
          >
            {MEMBERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-1">
            Date
          </label>
          <input
            name="date"
            type="date"
            defaultValue={today}
            required
            className="w-full bg-card border border-ink text-ink placeholder:text-muted rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-ink"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
            Split method
          </label>
          <input type="hidden" name="splitType" value={splitType} />
          <div className="flex gap-2">
            {(["equal", "percentage", "exact"] as SplitType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSplitType(t)}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium ${
                  splitType === t
                    ? "bg-primary text-ink font-semibold"
                    : "bg-card text-ink hover:bg-primary-pale"
                }`}
              >
                {t === "equal" ? "Equal" : t === "percentage" ? "By percentage" : "Custom"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-body mb-2">
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
                  className="h-5 w-5 rounded border-hairline accent-ink"
                />
                <label
                  htmlFor={`member-${m}`}
                  className="text-sm text-body w-24 py-2.5"
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
                      className="w-20 bg-card border border-ink text-ink rounded-lg px-2 py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    />
                    <span className="text-sm text-muted">%</span>
                  </div>
                )}

                {splitType === "exact" && included[m] && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted">{currency}</span>
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
                      className="w-28 bg-card border border-ink text-ink rounded-lg px-2 py-1.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {splitType === "equal" && included[m] && total > 0 && (
                  <span className="text-sm text-muted">
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
                  ? "text-up"
                  : "text-down"
              }`}
            >
              Total: {percentageSum.toFixed(1)}% {Math.abs(percentageSum - 100) < 0.1 ? "✓" : "(must equal 100%)"}
            </p>
          )}

          {splitType === "exact" && activeMembers.length > 0 && total > 0 && (
            <p
              className={`mt-2 text-xs ${
                Math.abs(exactSum - total) < 0.02
                  ? "text-up"
                  : "text-down"
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
          className="w-full bg-primary text-ink py-3 rounded-3xl font-semibold hover:bg-primary-active transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
