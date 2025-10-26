import { createClient } from "@libsql/client";

function db() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });
}

async function getKV<T = any>(key: string): Promise<T | null> {
  const r = await db().execute({ sql: "SELECT value FROM kv WHERE key = ?", args: [key] });
  if (r.rows.length === 0) return null;
  return JSON.parse(r.rows[0].value as string);
}

async function setKV(key: string, value: any) {
  await db().execute({ sql: "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", args: [key, JSON.stringify(value)] });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok:false });

  try {
    const code = String(req.query.code || "").trim();
    const session = await getKV<any>(`session:${code}`);
    if (!session) return res.status(404).json({ ok:false, error:"Session inconnue" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { voter = "", buckets } = body;
    if (!voter || !buckets) return res.status(400).json({ ok:false, error:"voter et buckets requis" });

    const others = (session.votes || []).filter((v:any) => (v.voter||'').toLowerCase() !== String(voter).toLowerCase());
    const vote = { voter: String(voter), buckets, at: Date.now() };

    session.votes = [...others, vote];
    await setKV(`session:${code}`, session);

    return res.status(200).json({ ok:true });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
