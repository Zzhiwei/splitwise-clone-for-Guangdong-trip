# Splitwize

Lightweight Splitwise clone for a 4-person Guangdong trip. No auth — small trusted group. UI is in Chinese.

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
| `src/lib/actions.ts` | Server Actions: `addExpense`, `deleteExpense`, `resolveExpense` |
| `src/lib/balance.ts` | `calculateNetBalances` + `simplifyDebts` (greedy two-pointer) |
| `src/lib/constants.ts` | `MEMBERS` array |
| `src/app/page.tsx` | Dashboard — balances + last 20 expenses (excludes resolved) |
| `src/app/expenses/page.tsx` | Active expense history + CSV export |
| `src/app/resolved-expenses/page.tsx` | Resolved/settled expenses archive |
| `src/app/add/page.tsx` | Add expense form (client component) |
| `src/components/DeleteButton.tsx` | Confirm modal + soft-delete action |
| `src/components/ResolveButton.tsx` | Confirm modal + resolve action |
| `src/components/ExpenseList.tsx` | Expense cards; accepts `showResolve` prop |
| `src/components/BalanceSummary.tsx` | Net balances + settle-up transactions |

## Database

**There is no local DB.** All Prisma operations (migrations, queries) run against the remote Neon instance.

`.env` needs:
```
DATABASE_URL=postgresql://...   # pooled connection (runtime)
DIRECT_URL=postgresql://...     # direct connection (migrations)
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

## Soft delete & resolve

Both use nullable timestamp fields on `Expense` — rows are never hard-deleted.

- `deletedAt` — set on delete. All active queries filter `where: { deletedAt: null }`.
- `resolvedAt` — set when an expense is marked settled. Active queries also filter `where: { resolvedAt: null }`. Resolved expenses appear only on `/resolved-expenses`.

The dashboard balance calculations naturally exclude resolved expenses because they use the same filtered query.

## Split types

- `equal` — total divided evenly; rounding remainder goes to last person
- `percentage` — per-member percentage (must sum to 100%)
- `exact` — per-member amounts (must sum within ±0.02 of total)

## Deployment

Hosted on Vercel. Set `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables. Run `npx prisma migrate deploy` after any schema changes.
