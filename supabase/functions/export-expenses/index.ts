// Daily CSV export of expenses to Supabase Storage. Triggered by pg_cron (see supabase/setup-export-cron.sql).
// Runs only inside the trip window and only with the shared secret header.
import { createClient } from "npm:@supabase/supabase-js@2";

// Keep in sync with MEMBERS in src/lib/constants.ts (Deno can't import from src/).
const MEMBERS = ["Fangbing", "Gabriella", "Ignatius", "Souwmyaa", "Zhiwei"];
const BUCKET = "expense-exports";
const TZ = "Asia/Ho_Chi_Minh"; // UTC+7, the trip's time zone
const WINDOW = { from: "2026-11-19", to: "2026-11-26" }; // inclusive, TZ dates

type Split = { member: string; amount: number };
type Expense = {
  title: string;
  amount: number;
  paidBy: string;
  date: string;
  splitType: string;
  currency: string;
  resolvedAt: string | null;
  Split: Split[];
};

// Prefix formula-leading characters so spreadsheets treat user text (title, names) as text, not a formula.
const q = (cell: string) => {
  const safe = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
  return `"${safe.replace(/"/g, '""')}"`;
};

function toCsv(expenses: Expense[]): string {
  const rows: string[][] = [
    // Amounts are in each expense's own currency (see the Currency column); no conversion here.
    ["Date", "Title", "Paid By", "Currency", "Total", "Split Type", ...MEMBERS, "Status"],
  ];
  for (const e of expenses) {
    const byMember = Object.fromEntries(e.Split.map((s) => [s.member, s.amount.toFixed(2)]));
    rows.push([
      new Date(e.date).toLocaleDateString("en-GB", { timeZone: TZ }),
      e.title,
      e.paidBy,
      e.currency,
      e.amount.toFixed(2),
      e.splitType,
      ...MEMBERS.map((m) => byMember[m] ?? ""),
      e.resolvedAt ? "resolved" : "active",
    ]);
  }
  return rows.map((r) => r.map(q).join(",")).join("\n");
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("EXPORT_CRON_SECRET")) {
    return new Response("unauthorized", { status: 401 });
  }

  // en-CA formats as YYYY-MM-DD
  const today = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  if (today < WINDOW.from || today > WINDOW.to) {
    return new Response(`outside window (${today})`, { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("Expense")
    .select("title, amount, paidBy, date, splitType, currency, resolvedAt, Split(member, amount)")
    .is("deletedAt", null)
    .order("date", { ascending: true });
  if (error) return new Response(error.message, { status: 500 });

  const path = `expenses-${today}.csv`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, new Blob([toCsv(data as Expense[])], { type: "text/csv" }), { upsert: true });
  if (upErr) return new Response(upErr.message, { status: 500 });

  return new Response(`saved ${path} (${data.length} expenses)`, { status: 200 });
});
