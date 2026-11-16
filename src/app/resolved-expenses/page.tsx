import { prisma } from "@/lib/db";
import ExpenseList from "@/components/ExpenseList";
import { getFxRate } from "@/lib/fx";
import { convertExpenses } from "@/lib/currency";
import { getDisplayCurrency } from "@/lib/display-currency";

export default async function ResolvedExpensesPage() {
  const display = getDisplayCurrency();
  const [rows, fxRate] = await Promise.all([
    prisma.expense.findMany({
      where: { deletedAt: null, resolvedAt: { not: null } },
      include: { splits: true },
      orderBy: { resolvedAt: "desc" },
    }),
    getFxRate(),
  ]);
  const expenses = convertExpenses(rows, display, fxRate);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black text-ink tracking-tight">Resolved expenses</h1>
        <p className="text-sm text-muted mt-0.5">{expenses.length} expenses</p>
      </div>
      <ExpenseList expenses={expenses} currency={display} showResolve={false} showUnresolve={true} />
    </div>
  );
}
