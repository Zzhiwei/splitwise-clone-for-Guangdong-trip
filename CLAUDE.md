# Splitwize

Lightweight Splitwise clone for a 4-person Guangdong trip. Password-protected (shared secret). UI is in Chinese.

## Stack

- **Next.js 14** (App Router, TypeScript, `src/` layout)
- **Tailwind CSS** — no component libraries
- **Prisma v7** with `@prisma/adapter-pg` driver adapter (required for Prisma 7)
- **Neon Postgres** (remote only — no local DB; `.env` points directly to Neon)
- **Next.js Server Actions** for all mutations
- **Vercel** for deployment

## Members

Defined in `src/lib/constants.ts`: `["Zhiwei", "Lin Chen", "Bojun", "Haozhe"]`

To add/remove members, update `MEMBERS` there. The `ExportButton` CSV columns are hardcoded to match — update those too.

## Key files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Data model |
| `prisma.config.ts` | Prisma CLI config — reads `DATABASE_URL` / `DIRECT_URL` from `.env` |
| `src/lib/db.ts` | Prisma singleton using `PrismaPg` adapter |
| `src/middleware.ts` | Auth gate — redirects to `/login` if `splitwize_auth` cookie absent |
| `src/app/login/page.tsx` | Full-screen password entry page |
| `src/lib/actions.ts` | Server Actions: `addExpense`, `deleteExpense`, `resolveExpense`, `toggleSplitPaidBack`, `verifyPassword` |
| `src/lib/balance.ts` | `calculateNetBalances` + `simplifyDebts` (greedy two-pointer) |
| `src/lib/constants.ts` | `MEMBERS` array |
| `src/app/page.tsx` | Dashboard — balances + last 20 expenses (excludes resolved) |
| `src/app/expenses/page.tsx` | Active expense history + CSV export |
| `src/app/resolved-expenses/page.tsx` | Resolved/settled expenses archive |
| `src/app/add/page.tsx` | Add expense form (client component) |
| `src/components/DeleteButton.tsx` | Confirm modal + soft-delete action |
| `src/components/ResolveButton.tsx` | Confirm modal + resolve action |
| `src/components/ExpenseList.tsx` | Expense cards; accepts `showResolve` prop |
| `src/components/SplitRow.tsx` | Per-split repayment toggle (tappable, calls `toggleSplitPaidBack`) |
| `src/components/BalanceSummary.tsx` | Net balances + settle-up transactions |

## Database

**There is no local DB.** All Prisma operations (migrations, queries) run against the remote Neon instance.

`.env` needs:
```
DATABASE_URL=postgresql://...   # pooled connection (runtime)
DIRECT_URL=postgresql://...     # direct connection (migrations)
APP_PASSWORD=...                # shared password for the auth gate
```

### Migrations

```bash
npx prisma migrate dev --name <description>   # creates + applies migration to Neon
npx prisma migrate deploy                     # apply in production (Vercel build)
npx prisma generate                           # regenerate client after schema changes
```

If the generated client is stale after `prisma generate`, delete `src/generated/prisma/` entirely and re-run `npx prisma generate`.

## Dev

```bash
npm run dev       # starts on :3000
npm run build     # production build
npm run lint
```

## Auth

`src/middleware.ts` checks for an `httpOnly` cookie `splitwize_auth=ok` on every request (except `/login` and static assets). Missing or invalid cookie → redirect to `/login`. The login page calls the `verifyPassword` server action, which compares against `process.env.APP_PASSWORD` and sets the cookie (30-day expiry) on success. `APP_PASSWORD` is never exposed to the client.

## Soft delete & resolve

Both use nullable timestamp fields on `Expense` — rows are never hard-deleted.

- `deletedAt` — set on delete. All active queries filter `where: { deletedAt: null }`.
- `resolvedAt` — set when an expense is marked settled. Active queries also filter `where: { resolvedAt: null }`. Resolved expenses appear only on `/resolved-expenses`.

The dashboard balance calculations naturally exclude resolved expenses because they use the same filtered query.

## Per-split repayment (`paidBack`)

`Split.paidBack Boolean @default(false)` tracks whether a participant has already paid the expense payer back for their share. Toggled via `SplitRow` in the expense list (tap to toggle; payer's own split row is non-interactive).

Balance logic in `calculateNetBalances`: if `paidBack = true`, the payer is debited that split's amount (money already received); if `false`, the member is debited as usual. This means marking splits as paid-back reduces the payer's net positive and zeroes out the member's debt without requiring a separate expense.

## Split types

- `equal` — total divided evenly; rounding remainder goes to last person
- `percentage` — per-member percentage (must sum to 100%)
- `exact` — per-member amounts (must sum within ±0.02 of total)

## Deployment

Hosted on Vercel. Set `DATABASE_URL`, `DIRECT_URL`, and `APP_PASSWORD` in Vercel environment variables. Run `npx prisma migrate deploy` after any schema changes.
