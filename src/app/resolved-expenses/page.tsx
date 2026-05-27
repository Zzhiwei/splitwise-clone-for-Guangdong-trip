import { prisma } from "@/lib/db";
import ExpenseList from "@/components/ExpenseList";

export default async function ResolvedExpensesPage() {
  const expenses = await prisma.expense.findMany({
    where: { deletedAt: null, resolvedAt: { not: null } },
    include: { splits: true },
    orderBy: { resolvedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">已结清账单</h1>
        <p className="text-sm text-gray-500 mt-0.5">共 {expenses.length} 笔</p>
      </div>
      <ExpenseList expenses={expenses} showResolve={false} />
    </div>
  );
}
