import { prisma } from "@/lib/db";
import { calculateNetBalances, simplifyDebts } from "@/lib/balance";
import BalanceSummary from "@/components/BalanceSummary";
import ExpenseList from "@/components/ExpenseList";
import { TRIP_NAME } from "@/lib/constants";

export default async function DashboardPage() {
  const expenses = await prisma.expense.findMany({
    where: { deletedAt: null, resolvedAt: null },
    include: { splits: true },
    orderBy: { date: "desc" },
  });

  const net = calculateNetBalances(expenses);
  const transactions = simplifyDebts(net);
  const recent = expenses.slice(0, 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{TRIP_NAME}</h1>
      <BalanceSummary net={net} transactions={transactions} />
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent expenses</h2>
          <a href="/expenses" className="text-sm text-indigo-600 hover:underline">
            View all
          </a>
        </div>
        <ExpenseList expenses={recent} />
      </div>
    </div>
  );
}
