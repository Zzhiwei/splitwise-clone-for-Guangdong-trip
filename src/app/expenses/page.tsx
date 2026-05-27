import { prisma } from "@/lib/db";
import ExpenseList from "@/components/ExpenseList";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    include: { splits: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">All Expenses</h1>
      <p className="text-sm text-gray-500">{expenses.length} total</p>
      <ExpenseList expenses={expenses} />
    </div>
  );
}
