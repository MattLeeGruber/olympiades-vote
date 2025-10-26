import { createClient } from "@libsql/client";

// petite factory commune
function db() {
  const url = process.env.TURSO_DATABASE_URL!;
  const token = process.env.TURSO_AUTH_TOKEN!;
  return createClient({ url, authToken: token });
}

// crée la table si elle n'existe pas (idempotent)
async function ensureTable() {
  const client = db();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS kv (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export default async function handler(_req: any, res: any) {
  try {
    await ensureTable();
    res.status(200).json({ ok: true, msg: "DB OK & table kv OK" });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
