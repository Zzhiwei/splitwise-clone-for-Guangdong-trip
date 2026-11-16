import Link from "next/link";
import CurrencyToggle from "./CurrencyToggle";
import { getDisplayCurrency } from "@/lib/display-currency";

const linkClass = "py-2 text-gray-600 hover:text-indigo-600";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 pt-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-indigo-600 py-2">
          Splitwize
        </Link>
        <CurrencyToggle current={getDisplayCurrency()} />
      </div>
      <div className="max-w-2xl mx-auto px-4 py-1 flex items-center justify-between text-sm whitespace-nowrap">
        <Link href="/" className={linkClass}>
          Home
        </Link>
        <Link href="/expenses" className={linkClass}>
          Expenses
        </Link>
        <Link href="/resolved-expenses" className={linkClass}>
          Resolved
        </Link>
        <Link
          href="/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          + Add
        </Link>
      </div>
    </nav>
  );
}
