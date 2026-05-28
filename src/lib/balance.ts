import { MEMBERS } from "./constants";

type ExpenseWithSplits = {
  paidBy: string;
  amount: number;
  splits: { member: string; amount: number; paidBack: boolean }[];
};

export type NetBalance = Record<string, number>;

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export function calculateNetBalances(expenses: ExpenseWithSplits[]): NetBalance {
  const net: NetBalance = Object.fromEntries(MEMBERS.map((m) => [m, 0]));

  for (const expense of expenses) {
    net[expense.paidBy] += expense.amount;
    for (const split of expense.splits) {
      if (split.paidBack) {
        net[expense.paidBy] -= split.amount;
      } else {
        net[split.member] -= split.amount;
      }
    }
  }

  for (const key of Object.keys(net)) {
    net[key] = Math.round(net[key] * 100) / 100;
  }

  return net;
}

export function simplifyDebts(net: NetBalance): Transaction[] {
  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0.01)
    .map(([member, amount]) => ({ member, amount }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = Object.entries(net)
    .filter(([, v]) => v < -0.01)
    .map(([member, amount]) => ({ member, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const settle = Math.min(creditors[i].amount, debtors[j].amount);
    transactions.push({
      from: debtors[j].member,
      to: creditors[i].member,
      amount: Math.round(settle * 100) / 100,
    });
    creditors[i].amount -= settle;
    debtors[j].amount -= settle;
    if (creditors[i].amount < 0.01) i++;
    if (debtors[j].amount < 0.01) j++;
  }

  return transactions;
}
