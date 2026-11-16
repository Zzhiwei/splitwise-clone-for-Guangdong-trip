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
      <div className="bg-card rounded-3xl border border-hairline p-4">
        <h2 className="text-lg font-semibold text-ink mb-3">Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(net).map(([member, amount]) => {
            const owed = amount > 0;
            const owes = amount < 0;
            return (
              <div
                key={member}
                className="flex items-center gap-3 p-3 rounded-2xl bg-elevated"
              >
                <Avatar member={member} size={40} />
                <span className="flex-1 min-w-0 truncate font-semibold text-ink">{member}</span>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                      owed
                        ? "bg-primary-pale text-up"
                        : owes
                        ? "bg-down/10 text-down"
                        : "bg-card text-muted"
                    }`}
                  >
                    {owed ? "owed" : owes ? "owes" : "settled"}
                  </span>
                  {(owed || owes) && (
                    <span className="tabular-nums font-bold text-ink whitespace-nowrap">
                      {formatMoney(Math.abs(amount), currency)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-hairline p-4">
        <h2 className="text-lg font-semibold text-ink mb-3">Suggested settle-up</h2>
        {transactions.length === 0 ? (
          <p className="text-muted text-sm">Everyone is settled up 🎉</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((t, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-down">{t.from}</span>
                <span className="text-muted">→</span>
                <span className="font-medium text-up">{t.to}</span>
                <span className="ml-auto tabular-nums font-semibold text-ink whitespace-nowrap">
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
