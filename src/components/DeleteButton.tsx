"use client";

import { deleteExpense } from "@/lib/actions";
import { useState, useTransition } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(() => deleteExpense(id));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-xs text-red-400 hover:text-red-600"
      >
        删除
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-72 space-y-4">
            <p className="text-sm font-medium text-gray-800">确认删除这笔账单？</p>
            <p className="text-xs text-gray-500">删除后无法恢复。</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirm(false)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirm}
                className="text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 flex items-center gap-2"
              >
                {isPending && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {isPending ? "删除中…" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
