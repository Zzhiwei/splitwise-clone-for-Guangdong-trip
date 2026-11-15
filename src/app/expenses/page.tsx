import { prisma } from "@/lib/db";
import ExpenseList from "@/components/ExpenseList";
import ExportButton from "@/components/ExportButton";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    where: { deletedAt: null, resolvedAt: null },
    include: { splits: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{expenses.length} expenses</p>
        </div>
        {expenses.length > 0 && <ExportButton expenses={expenses} />}
      </div>
      <ExpenseList expenses={expenses} />
    </div>
  );
}
