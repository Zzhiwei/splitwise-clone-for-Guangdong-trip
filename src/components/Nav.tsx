import Link from "next/link";
import CurrencyToggle from "./CurrencyToggle";
import { getDisplayCurrency } from "@/lib/display-currency";

const linkClass = "py-2 font-medium text-body hover:text-primary";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-10 bg-canvas border-b border-hairline">
      <div className="max-w-2xl mx-auto px-4 pt-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary py-2">
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
          className="bg-primary text-ink font-semibold px-4 py-2 rounded-md hover:bg-primary-active"
        >
          + Add
        </Link>
      </div>
    </nav>
  );
}
