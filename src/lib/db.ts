/**
 * CardIntel — Prisma Database Client (Singleton)
 *
 * Uses Neon serverless adapter for optimal Vercel compatibility.
 * Global singleton prevents connection exhaustion during Next.js hot-reload.
 */

import { PrismaClient } from "@prisma/client";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Enable WebSocket connections for Neon serverless
// Required for edge runtime compatibility
neonConfig.useSecureWebSocket = true;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/cardintel?sslmode=require";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
