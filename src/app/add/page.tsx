import { prisma } from "@/lib/db";
import { DEFAULT_SGD_TO_VND } from "@/lib/constants";
import AddExpenseForm from "@/components/AddExpenseForm";

export const dynamic = "force-dynamic";

export default async function AddExpensePage() {
  // Last-used rate is the shared rate; changing it on the form updates it for the next expense.
  const last = await prisma.expense.findFirst({
    where: { fxRate: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { fxRate: true },
  });
  return <AddExpenseForm defaultRate={last?.fxRate ?? DEFAULT_SGD_TO_VND} />;
}
