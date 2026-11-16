import type { Expense, Split } from "@/generated/prisma/client";
import type { Currency } from "@/lib/constants";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import ResolveButton from "./ResolveButton";
import UnresolveButton from "./UnresolveButton";
import SplitRow from "./SplitRow";
import { formatMoney } from "@/lib/format";

// Amounts are already converted to the display currency; source* hold what was entered.
type ExpenseWithSplits = Expense & {
  splits: (Split & { paidBack: boolean })[];
  sourceCurrency: string;
  sourceAmount: number;
};

interface Props {
  expenses: ExpenseWithSplits[];
  currency: Currency;
  showResolve?: boolean;
  showUnresolve?: boolean;
}

// Payer first, then unpaid, then paid back. Array.sort is stable, so ties keep stored order.
const splitRank = (s: { member: string; paidBack: boolean }, paidBy: string) =>
  s.member === paidBy ? 0 : s.paidBack ? 2 : 1;

export default function ExpenseList({ expenses, currency, showResolve = true, showUnresolve = false }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-3xl border border-hairline p-6 text-center text-muted">
        No expenses yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="bg-card rounded-3xl border border-hairline p-4"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-ink break-words">{expense.title}</p>
              <p className="text-sm text-muted">
                Paid by:{" "}
                <span className="font-medium text-body">{expense.paidBy}</span>
                {" · "}
                {new Date(expense.date).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="tabular-nums text-lg font-bold text-ink whitespace-nowrap">
                {formatMoney(expense.amount, currency)}
              </span>
              {expense.sourceCurrency !== currency && (
                <p className="tabular-nums text-xs text-muted whitespace-nowrap">
                  {expense.sourceCurrency} {expense.sourceAmount.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="mt-2 divide-y divide-hairline">
            {[...expense.splits]
              .sort((a, b) => splitRank(a, expense.paidBy) - splitRank(b, expense.paidBy))
              .map((s) => (
              <SplitRow
                key={s.id}
                splitId={s.id}
                member={s.member}
                amount={s.amount}
                paidBack={s.paidBack}
                paidBy={expense.paidBy}
                currency={currency}
              />
            ))}
          </div>
          <div className="mt-2 pt-1 border-t border-hairline flex justify-end">
            {showResolve && <ResolveButton id={expense.id} />}
            {showUnresolve && <UnresolveButton id={expense.id} />}
            <Link
              href={`/expenses/${expense.id}/edit`}
              className="min-h-[44px] px-3 inline-flex items-center text-sm font-medium text-ink hover:opacity-80"
            >
              Edit
            </Link>
            <DeleteButton id={expense.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
