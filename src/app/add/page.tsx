import AddExpenseForm from "@/components/AddExpenseForm";
import { getDisplayCurrency } from "@/lib/display-currency";

export const dynamic = "force-dynamic";

export default function AddExpensePage() {
  return <AddExpenseForm defaultCurrency={getDisplayCurrency()} />;
}
