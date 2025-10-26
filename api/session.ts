import { createClient } from "@libsql/client";

function db() {
  const url = process.env.TURSO_DATABASE_URL!;
  const token = process.env.TURSO_AUTH_TOKEN!;
  return createClient({ url, authToken: token });
}

async function ensureTable() {
  const client = db();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS kv (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

async function getKV<T = any>(key: string): Promise<T | null> {
  const client = db();
  const result = await client.execute({
    sql: "SELECT value FROM kv WHERE key = ?",
    args: [key],
  });
  if (result.rows.length === 0) return null;
  const raw = result.rows[0].value as string;
  return JSON.parse(raw);
}

async function setKV(key: string, value: any) {
  const client = db();
  await client.execute({
    sql: "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
    args: [key, JSON.stringify(value)],
  });
}

const WORDS = ["SPARTIATE","PHENIX","SCORPION","HYDRE","CENTAURE","CYCLOPE","MANTICORE","CERBERE","PEGASE","HARPYE"];
const genCode = () => `${WORDS[Math.floor(Math.random()*WORDS.length)]}-${100+Math.floor(Math.random()*900)}`;

// lecture sûre du body (fonctionne avec Vercel)
async function readBody(req: any) {
  try {
    if (req.body) {
      if (typeof req.body === "string") return JSON.parse(req.body);
      return req.body;
    }
    const chunks: Uint8Array[] = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString("utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  try {
    await ensureTable();

    const body = await readBody(req);
    const { selectedIds = [], theme = "bronze" } = body || {};
    if (!Array.isArray(selectedIds)) {
      return res.status(400).json({ ok: false, error: "selectedIds doit être un tableau" });
    }

    const code = genCode();
    const session = {
      code,
      theme,
      selectedIds,
      createdAt: Date.now(),
      votes: [] as any[],
    };

    await setKV(`session:${code}`, session);
    return res.status(200).json({ ok: true, code, url: `/join/${code}` });
  } catch (e: any) {
    // log lisible côté client si jamais
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
