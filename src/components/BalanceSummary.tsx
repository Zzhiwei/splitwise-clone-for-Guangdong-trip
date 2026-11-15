import type { NetBalance, Transaction } from "@/lib/balance";
import { formatVnd } from "@/lib/format";
import Avatar from "./Avatar";

interface Props {
  net: NetBalance;
  transactions: Transaction[];
}

export default function BalanceSummary({ net, transactions }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Balances</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(net).map(([member, amount]) => (
            <div
              key={member}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
            >
              <Avatar member={member} />
              <div className="flex flex-col min-w-0">
              <span className="font-medium text-gray-700">{member}</span>
              <span
                className={`font-bold text-sm mt-0.5 ${
                  amount > 0
                    ? "text-green-600"
                    : amount < 0
                    ? "text-red-600"
                    : "text-gray-400"
                }`}
              >
                {amount > 0 ? "+" : ""}
                {formatVnd(amount)}
              </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Suggested settle-up</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">Everyone is settled up 🎉</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-red-600">{t.from}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-green-600">{t.to}</span>
                <span className="ml-auto font-bold text-gray-800">
                  {formatVnd(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
