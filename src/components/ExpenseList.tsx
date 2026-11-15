import type { Expense, Split } from "@/generated/prisma/client";
import DeleteButton from "./DeleteButton";
import ResolveButton from "./ResolveButton";
import UnresolveButton from "./UnresolveButton";
import SplitRow from "./SplitRow";
import { formatVnd } from "@/lib/format";

type ExpenseWithSplits = Expense & { splits: (Split & { paidBack: boolean })[] };

interface Props {
  expenses: ExpenseWithSplits[];
  showResolve?: boolean;
  showUnresolve?: boolean;
}

export default function ExpenseList({ expenses, showResolve = true, showUnresolve = false }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        No expenses yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{expense.title}</p>
              <p className="text-sm text-gray-500">
                Paid by:{" "}
                <span className="font-medium text-gray-700">{expense.paidBy}</span>
                {" · "}
                {new Date(expense.date).toLocaleDateString("en-GB")}
              </p>
              <div className="mt-2 space-y-0.5">
                {expense.splits.map((s) => (
                  <SplitRow
                    key={s.id}
                    splitId={s.id}
                    member={s.member}
                    amount={s.amount}
                    paidBack={s.paidBack}
                    paidBy={expense.paidBy}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  {formatVnd(expense.amount)}
                </span>
                {expense.originalAmount != null && (
                  <p className="text-xs text-gray-400">
                    {expense.currency} {expense.originalAmount.toFixed(2)}
                  </p>
                )}
              </div>
              {showResolve && <ResolveButton id={expense.id} />}
              {showUnresolve && <UnresolveButton id={expense.id} />}
              <DeleteButton id={expense.id} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
