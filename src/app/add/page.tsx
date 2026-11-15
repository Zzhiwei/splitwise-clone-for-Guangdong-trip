import { getFxRate } from "@/lib/fx";
import AddExpenseForm from "@/components/AddExpenseForm";

export const dynamic = "force-dynamic";

export default async function AddExpensePage() {
  return <AddExpenseForm rate={await getFxRate()} />;
}
