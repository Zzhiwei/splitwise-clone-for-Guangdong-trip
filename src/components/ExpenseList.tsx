import type { Expense, Split } from "@/generated/prisma/client";
import type { Currency } from "@/lib/constants";
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

export default function ExpenseList({ expenses, currency, showResolve = true, showUnresolve = false }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-hairline p-6 text-center text-muted">
        No expenses yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="bg-card rounded-xl border border-hairline p-4"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-white break-words">{expense.title}</p>
              <p className="text-sm text-muted">
                Paid by:{" "}
                <span className="font-medium text-body">{expense.paidBy}</span>
                {" · "}
                {new Date(expense.date).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-num text-lg font-bold text-white whitespace-nowrap">
                {formatMoney(expense.amount, currency)}
              </span>
              {expense.sourceCurrency !== currency && (
                <p className="font-num text-xs text-muted whitespace-nowrap">
                  {expense.sourceCurrency} {expense.sourceAmount.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="mt-2 divide-y divide-hairline">
            {expense.splits.map((s) => (
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
            <DeleteButton id={expense.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}
