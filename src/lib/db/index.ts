import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { SCHEMA_SQL } from "./schema-sql";

function resolveClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    return createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
  }

  const configured = process.env.DATABASE_URL ?? "./data/ptcgl.db";
  const dbPath = path.isAbsolute(configured)
    ? configured
    : path.join(/* turbopackIgnore: true */ process.cwd(), configured);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  // Local file via libSQL (same dialect as Turso)
  return createClient({
    url: `file:${dbPath.replace(/\\/g, "/")}`,
  });
}

const client = resolveClient();
export const db = drizzle(client, { schema });

let migrated = false;

async function safeAddColumn(sql: string) {
  try {
    await client.execute(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!/duplicate column|already exists/i.test(msg)) throw e;
  }
}

export async function ensureDb() {
  if (migrated) return;
  await client.executeMultiple(SCHEMA_SQL);
  await safeAddColumn(
    "ALTER TABLE matches ADD COLUMN user_note TEXT NOT NULL DEFAULT ''",
  );
  migrated = true;
}
