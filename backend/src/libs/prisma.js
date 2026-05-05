import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
import pg from "pg";
const { PrismaClient } = pkg;
const { Pool } = pg;

const normalizeDatabaseUrl = (value = "") => {
  if (!value) return value;

  try {
    const parsed = new URL(value);
    const sslmode = parsed.searchParams.get("sslmode");

    if (sslmode && ["prefer", "require", "verify-ca"].includes(sslmode)) {
      parsed.searchParams.set("sslmode", "verify-full");
    }

    return parsed.toString();
  } catch {
    return value
      .replace(/sslmode=prefer/gi, "sslmode=verify-full")
      .replace(/sslmode=require/gi, "sslmode=verify-full")
      .replace(/sslmode=verify-ca/gi, "sslmode=verify-full");
  }
};

const connectionString = normalizeDatabaseUrl(`${process.env.DATABASE_URL || ""}`);
const pool = new Pool({
  connectionString,
  max: 10,
});

const adapter = new PrismaPg(pool, { disposeExternalPool: true });
const prisma = new PrismaClient({ adapter });

export { prisma };
