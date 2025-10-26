import { createClient } from "@libsql/client";

function db() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });
}

async function getKV<T = any>(key: string): Promise<T | null> {
  const r = await db().execute({
    sql: "SELECT value FROM kv WHERE key = ?",
    args: [key],
  });
  if (r.rows.length === 0) return null;
  const raw = r.rows[0].value as string;
  return JSON.parse(raw) as T;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  try {
    const code = String(req.query.code || "").trim();
    if (!code) return res.status(400).json({ ok: false, error: "Code manquant" });

    const session = await getKV<any>(`session:${code}`);
    if (!session) return res.status(404).json({ ok: false, error: "Session inconnue" });

    return res.status(200).json({ ok: true, session });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
