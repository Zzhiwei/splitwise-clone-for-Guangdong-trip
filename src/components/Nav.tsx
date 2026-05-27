import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          Splitwize
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-indigo-600">
            首页
          </Link>
          <Link href="/expenses" className="text-gray-600 hover:text-indigo-600">
            账单
          </Link>
          <Link href="/resolved-expenses" className="text-gray-600 hover:text-indigo-600">
            已结清
          </Link>
          <Link
            href="/add"
            className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
          >
            + 记账
          </Link>
        </div>
      </div>
    </nav>
  );
}
