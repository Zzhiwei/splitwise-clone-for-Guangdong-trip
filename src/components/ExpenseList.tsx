import type { Expense, Split } from "@/generated/prisma/client";
import DeleteButton from "./DeleteButton";
import ResolveButton from "./ResolveButton";
import UnresolveButton from "./UnresolveButton";
import SplitRow from "./SplitRow";

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
        暂无账单。
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
                付款人：{" "}
                <span className="font-medium text-gray-700">{expense.paidBy}</span>
                {" · "}
                {new Date(expense.date).toLocaleDateString("zh-CN")}
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
              <span className="text-lg font-bold text-gray-900">
                ¥{expense.amount.toFixed(2)}
              </span>
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
