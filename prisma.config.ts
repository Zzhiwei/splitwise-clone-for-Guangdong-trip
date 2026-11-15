import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migrate) needs a non-transaction-pooled connection; Supabase's 6543 pooler breaks it.
    url: (process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"])!,
  },
});
