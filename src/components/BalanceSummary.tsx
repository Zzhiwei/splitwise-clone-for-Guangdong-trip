import type { NetBalance, Transaction } from "@/lib/balance";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/constants";
import Avatar from "./Avatar";

interface Props {
  net: NetBalance;
  transactions: Transaction[];
  currency: Currency;
}

export default function BalanceSummary({ net, transactions, currency }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-hairline p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(net).map(([member, amount]) => (
            <div
              key={member}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-elevated"
            >
              <Avatar member={member} size={36} />
              <span className="flex-1 min-w-0 truncate font-medium text-body">{member}</span>
              <span
                className={`font-num font-semibold text-sm whitespace-nowrap ${
                  amount > 0
                    ? "text-up"
                    : amount < 0
                    ? "text-down"
                    : "text-muted"
                }`}
              >
                {amount > 0 ? "+" : ""}
                {formatMoney(amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-hairline p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Suggested settle-up</h2>
        {transactions.length === 0 ? (
          <p className="text-muted text-sm">Everyone is settled up 🎉</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-down">{t.from}</span>
                <span className="text-muted">→</span>
                <span className="font-medium text-up">{t.to}</span>
                <span className="ml-auto font-num font-semibold text-white whitespace-nowrap">
                  {formatMoney(t.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
