-- Expense.amount / Split.amount now live in the expense's own currency, so the old
-- VND-converted rows are meaningless. Existing data is deliberately wiped.
DELETE FROM "Split";
DELETE FROM "Expense";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "originalAmount";
