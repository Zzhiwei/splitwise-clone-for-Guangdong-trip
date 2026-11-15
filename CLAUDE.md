# Splitwize

Lightweight Splitwise clone for a group trip (currently the Vietnam trip, 5 people; previously Guangdong). Password-protected (shared secret). UI is in English.

## Stack

- **Next.js 14** (App Router, TypeScript, `src/` layout)
- **Tailwind CSS** — no component libraries
- **Prisma v7** with `@prisma/adapter-pg` driver adapter (required for Prisma 7)
- **Supabase Postgres** (remote only — no local DB; `.env` points directly to Supabase)
- **Next.js Server Actions** for all mutations
- **Vercel** for deployment

## Members

Defined in `src/lib/constants.ts` (`MEMBERS`, plus `TRIP_NAME`). To add/remove members, update `MEMBERS` there; `ExportButton` and the add form read it. `balance.test.ts` mocks `./constants` with the original 4 Guangdong members so its fixtures stay valid when `MEMBERS` changes.

Data recorded under a member who is no longer in `MEMBERS` breaks `calculateNetBalances` (it produces a `NaN` balance), so clear or archive old-trip data when changing members.

`public/profile-pics/<lowercased member name>.png` holds one photo per member (for example `zhiwei.png`); adding a member means adding a matching file. `Avatar` shows them next to each balance on the home page. It uses a plain `<img>` on purpose: `next/image`'s optimizer fetches the file server-side without the auth cookie, so the middleware would redirect it to `/login` and return a 400. The originals are 130-730 KB each and are served unresized.

## Key files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Data model |
| `prisma.config.ts` | Prisma CLI config — uses `DIRECT_URL` (falls back to `DATABASE_URL`) from `.env` |
| `src/lib/db.ts` | Prisma singleton using `PrismaPg` adapter |
| `src/middleware.ts` | Auth gate — redirects to `/login` if `splitwize_auth` cookie absent |
| `src/app/login/page.tsx` | Full-screen password entry page |
| `src/lib/actions.ts` | Server Actions: `addExpense`, `deleteExpense`, `resolveExpense`, `unresolveExpense`, `toggleSplitPaidBack`, `verifyPassword` |
| `src/lib/balance.ts` | `calculateNetBalances` + `simplifyDebts` (greedy two-pointer). Currency-unaware; keep changes here minimal, it was validated on a real trip |
| `src/lib/balance.test.ts` | Vitest cases for the balance logic (`npm test`) |
| `src/lib/constants.ts` | `MEMBERS`, `TRIP_NAME`, `BASE_CURRENCY`, `CURRENCIES`, `DEFAULT_SGD_TO_VND` |
| `src/app/page.tsx` | Dashboard — balances + last 20 expenses (excludes resolved) |
| `src/app/expenses/page.tsx` | Active expense history + CSV export |
| `src/app/resolved-expenses/page.tsx` | Resolved/settled expenses archive |
| `src/app/add/page.tsx` | Server wrapper for the add form; looks up the last-used FX rate |
| `src/components/AddExpenseForm.tsx` | Add expense form (client component); converts to VND before submit |
| `src/lib/fx.ts` | `getFxRate` — reads the global SGD→VND rate from the `Setting` table, falling back to `DEFAULT_SGD_TO_VND` |
| `src/components/FxRateEditor.tsx` | Rate display + edit control at the top of the home page (calls `setFxRate`) |
| `src/components/Avatar.tsx` | Member profile picture from `public/profile-pics/` |
| `src/lib/format.ts` | `formatVnd` (whole đồng, thousands separators, ₫ prefix). Used by every money display |
| `src/components/DeleteButton.tsx` | Confirm modal + soft-delete action |
| `src/components/ResolveButton.tsx` | Confirm modal + resolve action |
| `src/components/UnresolveButton.tsx` | Confirm modal + unresolve action |
| `src/components/ExpenseList.tsx` | Expense cards; accepts `showResolve` and `showUnresolve` props |
| `src/components/SplitRow.tsx` | Per-split repayment toggle (tappable, calls `toggleSplitPaidBack`) |
| `src/components/BalanceSummary.tsx` | Net balances + settle-up transactions |

## Database

**There is no local DB, and local dev uses the production DB.** `npm run dev` and every Prisma command run against the same Supabase project that the deployed app uses, so real group data is live while developing. Clean up any test rows you create, never touch rows you did not create, and note that a schema migration applied from a dev machine is already live in production (no separate `migrate deploy` is needed for the production database, though Vercel's `DATABASE_URL`/`DIRECT_URL` must point at the same project).

`.env` needs:
```
DATABASE_URL=postgresql://...   # Supabase transaction pooler, port 6543 (runtime)
DIRECT_URL=postgresql://...     # Supabase session pooler, port 5432 (migrations)
APP_PASSWORD=...                # shared password for the auth gate
```

Connection string rules:
- Use the pooler host (`aws-...pooler.supabase.com`) with user `postgres.<project-ref>`. The direct host `db.<ref>.supabase.co` is IPv6-only and often unreachable, so do not use it for `DIRECT_URL`.
- Remove the `[ ]` around `[YOUR-PASSWORD]` and URL-encode special characters in the password (`&` → `%26`, `?` → `%3F`, `@` → `%40`, `#` → `%23`). An alphanumeric password avoids this.
- Do not add `?pgbouncer=true`. That flag is for Prisma's old engine; the `pg` driver does not need it.
- The Prisma CLI must not run through the 6543 transaction pooler, which is why `prisma.config.ts` prefers `DIRECT_URL`.

On a network that blocks Postgres (for example behind a corporate proxy), TCP connects but the handshake hangs and Prisma reports `P1001`. Either switch networks or tunnel the DB ports through an HTTP `CONNECT` proxy; `pg` and Prisma have no built-in proxy support.

### Migrations

```bash
npx prisma migrate dev --name <description>   # creates + applies migration to Supabase
npx prisma migrate deploy                     # apply in production (Vercel build)
npx prisma generate                           # regenerate client after schema changes
```

Run `npm install` before any `npx prisma ...`. Without `node_modules`, `npx` downloads Prisma 8, which rejects `migrate deploy`.

`migrate dev` needs a shadow database, which the Supabase `postgres` user may not be allowed to create. The `20261115120000_add_currency`, `20261115130000_add_setting` and `20261115140000_drop_fx_rate` migrations were therefore written by hand (plain `ALTER TABLE` / `CREATE TABLE`, matching the `schema.prisma` change) and applied with `migrate deploy`. Do the same for future schema changes if `migrate dev` fails.

If the generated client is stale after `prisma generate`, delete `src/generated/prisma/` entirely and re-run `npx prisma generate`.

## Dev

```bash
npm run dev       # starts on :3000
npm run build     # production build
npm run lint
npm test          # vitest, balance logic only (no DB needed)
```

## Auth

`src/middleware.ts` checks for an `httpOnly` cookie `splitwize_auth=ok` on every request (except `/login` and static assets). Missing or invalid cookie → redirect to `/login`. The login page calls the `verifyPassword` server action, which compares against `process.env.APP_PASSWORD` and sets the cookie (30-day expiry) on success. `APP_PASSWORD` is never exposed to the client.

## Soft delete & resolve

Both use nullable timestamp fields on `Expense` — rows are never hard-deleted.

- `deletedAt` — set on delete. All active queries filter `where: { deletedAt: null }`.
- `resolvedAt` — set when an expense is marked settled. Active queries also filter `where: { resolvedAt: null }`. Resolved expenses appear only on `/resolved-expenses`. Resolving also sets `paidBack = true` on every split of the expense (in one transaction), and the resolve confirm modal says so. Can be unresolved (set back to `null`) via the `Undo resolve` button on that page; unresolving does not restore the splits' previous `paidBack` values.

The dashboard balance calculations naturally exclude resolved expenses because they use the same filtered query.

## Per-split repayment (`paidBack`)

`Split.paidBack Boolean @default(false)` tracks whether a participant has already paid the expense payer back for their share. Toggled via `SplitRow` in the expense list (tap to toggle; payer's own split row is non-interactive).

Balance logic in `calculateNetBalances`: if `paidBack = true`, the payer is debited that split's amount (money already received); if `false`, the member is debited as usual. This means marking splits as paid-back reduces the payer's net positive and zeroes out the member's debt without requiring a separate expense.

## Currency

All stored amounts (`Expense.amount`, `Split.amount`) are VND (`BASE_CURRENCY` in `constants.ts`), so `src/lib/balance.ts` is currency-unaware and unchanged. The add form accepts VND or SGD (`CURRENCIES`). The SGD→VND rate is one global app setting, stored in the `Setting` table (key `sgdToVnd`, model `Setting`). It is shown and edited in `FxRateEditor` at the top of the home page (server action `setFxRate`); until someone sets it, `DEFAULT_SGD_TO_VND` applies. The add form shows the rate read-only (it links to the home page to change it), converts the SGD total and splits to VND, and submits the converted values. `Expense.currency` and `originalAmount` record what was entered (audit only; never used in balance math). Expenses do not store the FX rate. Changing the global rate affects only expenses added afterwards; existing expenses keep their saved VND amounts.

Display: money is shown through `formatVnd` (whole đồng). Dates use the `en-GB` locale. Expense cards show the original amount (for example `SGD 100.00`) under the VND amount when `originalAmount` is set. The CSV export has per-member VND columns plus `Currency` and `Original Amount`.

## Split types

- `equal` — total divided evenly; rounding remainder goes to last person
- `percentage` — per-member percentage (must sum to 100%)
- `exact` — per-member amounts (must sum within ±0.02 of total). On the form they are typed in the selected currency; each is converted to VND and the last member's share absorbs rounding so the splits sum to the converted total

## Daily CSV export (Supabase Edge Function)

`supabase/functions/export-expenses/index.ts` is a Deno Edge Function (excluded from the Next typecheck in `tsconfig.json`). It reads all non-deleted expenses (active and resolved, with a `Status` column), builds the same CSV columns as `ExportButton`, and uploads `expenses-YYYY-MM-DD.csv` to the private Storage bucket `expense-exports` (one file per day, same-day reruns overwrite). It returns early unless the current date in `Asia/Ho_Chi_Minh` is inside `WINDOW` (2026-11-19 to 2026-11-26) and requires the `x-cron-secret` header to equal the `EXPORT_CRON_SECRET` function secret. `MEMBERS` is duplicated inside the function (Deno cannot import from `src/`); update both when members change. Both this function and `ExportButton` prefix any CSV cell starting with `=`, `+`, `-`, `@`, tab or CR with `'` so spreadsheets treat user text (titles, names) as text instead of running it as a formula; keep that in any new CSV code.

`supabase/setup-export-cron.sql` creates the bucket and schedules `pg_cron` job `export-expenses-daily` (`59 16 19-26 11 *` UTC = 23:59 Vietnam time, 19-26 November) which calls the function through `pg_net`, reading the secret from Vault. `pg_cron` has no year field, so unschedule the job after the trip (`select cron.unschedule('export-expenses-daily');`).

Status: deployed and scheduled on the production project (`jysgnkufiqafkmayhnog`) on 2026-11-15. Verified end to end: wrong or missing secret returns 401, a call outside the window returns `outside window (...)`, and inside the window it uploads a correct CSV (tested once with a temporary window and a seed row, both removed). The cron job's own HTTP call (Vault secret) was also run by hand and returned 200. The real scheduled firing happens first on 2026-11-19 23:59 Vietnam time; check Storage → `expense-exports` the next morning.

If you need to redo it (the Supabase CLI keeps local state in `supabase/.temp/`, which is gitignored):
- Deploy: `HTTPS_PROXY=... npx supabase functions deploy export-expenses --no-verify-jwt --use-api --remote=jysgnkufiqafkmayhnog --yes` (needs `npx supabase login` first; JWT verification must stay off because the cron call only sends the shared secret).
- Secret: `supabase secrets set EXPORT_CRON_SECRET=<value> --remote=...`; the same value must be in Vault as `export_cron_secret` (`setup-export-cron.sql` does that).
- Inspect a run: `select status_code, content from net._http_response order by created desc limit 5;` and `select * from cron.job_run_details order by start_time desc limit 5;`.
- After the trip: `select cron.unschedule('export-expenses-daily');`.

## Region and latency

The Supabase project is in `ap-southeast-2` (Sydney); the trip is in Vietnam. Supabase cannot change a project's region. Moving to Singapore was first judged not worth it (about 80-100 ms per page), but the plan below reverses that. What matters more is the Vercel function region: it should be close to the DB (`syd1`), otherwise every query crosses an ocean and a page with 2 sequential queries pays that twice. Check Vercel → Project Settings → Functions → Region, or set `"regions": ["syd1"]` in `vercel.json` (not present in the repo yet).

Measured on 2026-11-15: `curl -sI https://splitwize-vietnam.vercel.app/login | grep -i x-vercel-id` returned `sin1::iad1::...`. The first code is the edge, the second is the function region, so the functions ran in `iad1` (US East) against the Sydney DB, which explains pages taking about 2 s. Setting the region has not been done yet. Request flow diagrams are in `diagrams.md`.

Planned: move to a new Supabase project in `ap-southeast-1` (Singapore), since a project's region cannot be changed. Steps: create the project, run `npx prisma migrate deploy`, copy the data (including the `Setting` row), update `DATABASE_URL` on Vercel, set the Vercel function region to `sin1`, then redo the export function, secret, Vault entry and cron job on the new project and update the project ref in this file. This has not been done yet.

## Known limitations

- Money columns are `Float` (double precision). This is accurate enough for trip amounts: balances are rounded to 0.01 and split sums allow ±0.02. The one visible effect is 1 đồng display rounding, since VND is stored with 2 decimals but shown as whole đồng, so the displayed splits of an expense can differ from its displayed total by a few đồng. Switching to integer VND would mean changing `balance.ts` and the split code, so it was deliberately not done.
- Changing the global FX rate never revalues existing expenses.

## Deployment

Hosted on Vercel. Set `DATABASE_URL` and `APP_PASSWORD` in Vercel environment variables. `DIRECT_URL` is not needed there: only the Prisma CLI reads it (migrations run from a dev machine), and the Vercel build only runs `prisma generate`, which does not connect to the DB. Local dev and production share one database, so migrations applied locally are already live; no separate `migrate deploy` is needed unless you add another environment.
