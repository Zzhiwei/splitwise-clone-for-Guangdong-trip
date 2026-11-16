import { prisma } from "@/lib/db";
import { calculateNetBalances, simplifyDebts } from "@/lib/balance";
import BalanceSummary from "@/components/BalanceSummary";
import ExpenseList from "@/components/ExpenseList";
import { TRIP_NAME } from "@/lib/constants";
import { getFxRate } from "@/lib/fx";
import { convertExpenses } from "@/lib/currency";
import { getDisplayCurrency } from "@/lib/display-currency";
import FxRateEditor from "@/components/FxRateEditor";

export default async function DashboardPage() {
  const display = getDisplayCurrency();
  const [rows, fxRate] = await Promise.all([
    prisma.expense.findMany({
      where: { deletedAt: null, resolvedAt: null },
      include: { splits: true },
      orderBy: { date: "desc" },
    }),
    getFxRate(),
  ]);

  // Convert before the balance calculation so it only ever sees one currency.
  const expenses = convertExpenses(rows, display, fxRate);
  const net = calculateNetBalances(expenses);
  const transactions = simplifyDebts(net);
  const recent = expenses.slice(0, 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{TRIP_NAME}</h1>
      <FxRateEditor rate={fxRate} />
      <BalanceSummary net={net} transactions={transactions} currency={display} />
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent expenses</h2>
          <a href="/expenses" className="inline-block text-sm text-indigo-600 hover:underline py-3">
            View all
          </a>
        </div>
        <ExpenseList expenses={recent} currency={display} />
      </div>
    </div>
  );
}
