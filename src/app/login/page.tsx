"use client";

import { useState, useTransition } from "react";
import { verifyPassword } from "@/lib/actions";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await verifyPassword(password);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas">
      <div className="bg-card rounded-3xl border border-hairline p-8 w-80 space-y-5">
        <div className="text-center">
          <p className="text-2xl font-black text-ink tracking-tight">Splitwize</p>
          <p className="text-sm text-muted mt-1">Vietnam Trip</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-body mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full bg-card border border-ink text-ink placeholder:text-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-ink"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-xs text-down">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-ink py-2.5 rounded-3xl font-semibold hover:bg-primary-active transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {isPending ? "Verifying…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
