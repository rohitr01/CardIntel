// CardIntel — Prisma Configuration (Prisma 7+)
// Datasource URL moved here per Prisma 7 requirements

import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema"),
  migrate: {
    url: process.env.DATABASE_URL!,
  },
});
