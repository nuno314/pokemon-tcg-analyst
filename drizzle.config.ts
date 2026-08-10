import { defineConfig } from "drizzle-kit";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: tursoUrl
    ? {
        url: tursoUrl,
        authToken: tursoToken,
      }
    : {
        url: process.env.DATABASE_URL ?? "file:./data/ptcgl.db",
      },
});
