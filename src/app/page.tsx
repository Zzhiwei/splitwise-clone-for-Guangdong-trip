import { prisma } from "@/lib/db";
import { calculateNetBalances, simplifyDebts } from "@/lib/balance";
import BalanceSummary from "@/components/BalanceSummary";
import ExpenseList from "@/components/ExpenseList";
import RecentLimitPicker from "@/components/RecentLimitPicker";
import { Suspense } from "react";

const VALID_LIMITS = [5, 10, 20, "all"] as const;
type Limit = (typeof VALID_LIMITS)[number];

function parseLimit(raw: string | undefined): Limit {
  if (raw === "all") return "all";
  const n = Number(raw);
  return ([5, 10, 20] as number[]).includes(n) ? (n as Limit) : 5;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { show?: string };
}) {
  const limit = parseLimit(searchParams.show);

  const expenses = await prisma.expense.findMany({
    include: { splits: true },
    orderBy: { date: "desc" },
  });

  const net = calculateNetBalances(expenses);
  const transactions = simplifyDebts(net);
  const recent = limit === "all" ? expenses : expenses.slice(0, limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Guangdong Trip</h1>
      <BalanceSummary net={net} transactions={transactions} />
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
          <div className="flex items-center gap-3">
            <Suspense>
              <RecentLimitPicker current={limit} />
            </Suspense>
            <a href="/expenses" className="text-sm text-indigo-600 hover:underline">
              View all
            </a>
          </div>
        </div>
        <ExpenseList expenses={recent} />
      </div>
    </div>
  );
}
