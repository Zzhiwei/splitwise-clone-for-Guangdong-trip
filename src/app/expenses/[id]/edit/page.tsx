import { notFound } from "next/navigation";
import AddExpenseForm from "@/components/AddExpenseForm";
import { prisma } from "@/lib/db";
import { getDisplayCurrency } from "@/lib/display-currency";
import type { Currency } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const expense = await prisma.expense.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { splits: true },
  });
  if (!expense) notFound();

  return (
    <AddExpenseForm
      defaultCurrency={getDisplayCurrency()}
      expense={{
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        paidBy: expense.paidBy,
        date: expense.date.toISOString().split("T")[0],
        splitType: expense.splitType,
        currency: expense.currency as Currency,
        splits: expense.splits.map((s) => ({ member: s.member, amount: s.amount })),
      }}
    />
  );
}
