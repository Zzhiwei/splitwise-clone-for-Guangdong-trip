import { prisma } from "@/lib/db";
import ExpenseList from "@/components/ExpenseList";
import ExportButton from "@/components/ExportButton";
import { getFxRate } from "@/lib/fx";
import { convertExpenses } from "@/lib/currency";
import { getDisplayCurrency } from "@/lib/display-currency";

export default async function ExpensesPage() {
  const display = getDisplayCurrency();
  const [rows, fxRate] = await Promise.all([
    prisma.expense.findMany({
      where: { deletedAt: null, resolvedAt: null },
      include: { splits: true },
      orderBy: { date: "desc" },
    }),
    getFxRate(),
  ]);
  const expenses = convertExpenses(rows, display, fxRate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{expenses.length} expenses</p>
        </div>
        {expenses.length > 0 && <ExportButton expenses={expenses} currency={display} />}
      </div>
      <ExpenseList expenses={expenses} currency={display} />
    </div>
  );
}
