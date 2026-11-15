"use client";

import type { Expense, Split } from "@/generated/prisma/client";
import { MEMBERS } from "@/lib/constants";

type ExpenseWithSplits = Expense & { splits: Split[] };

export default function ExportButton({ expenses }: { expenses: ExpenseWithSplits[] }) {
  function handleExport() {
    const rows: string[][] = [
      ["Date", "Title", "Paid By", "Total (VND)", "Split Type", ...MEMBERS.map((m) => `${m} (VND)`), "Currency", "Original Amount"],
    ];

    for (const expense of expenses) {
      const splitMap = Object.fromEntries(
        expense.splits.map((s) => [s.member, s.amount.toFixed(2)])
      );
      rows.push([
        new Date(expense.date).toLocaleDateString("en-GB"),
        expense.title,
        expense.paidBy,
        expense.amount.toFixed(2),
        expense.splitType,
        ...MEMBERS.map((m) => splitMap[m] ?? ""),
        expense.currency,
        expense.originalAmount?.toFixed(2) ?? "",
      ]);
    }

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            // Neutralize spreadsheet formulas in user text (title, names).
            const safe = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
            return `"${safe.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `splitwize-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
    >
      Export CSV
    </button>
  );
}
