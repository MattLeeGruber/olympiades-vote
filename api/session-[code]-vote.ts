import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
});

async function getKV<T = any>(key: string): Promise<T | null> {
  const result = await db.execute({
    sql: "SELECT value FROM kv WHERE key = ?",
    args: [key],
  });
  if (result.rows.length === 0) return null;
  const raw = result.rows[0].value as string;
  return JSON.parse(raw);
}

async function setKV(key: string, value: any) {
  await db.execute({
    sql: "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
    args: [key, JSON.stringify(value)],
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = (req.query.code as string) || '';
  if (req.method !== 'POST') return res.status(405).json({ ok:false });

  const session = await getKV<any>(`session:${code}`);
  if (!session) return res.status(404).json({ ok:false, error:'Session inconnue' });

  const { voter = "", buckets } = req.body || {};
  if (!voter || !buckets) return res.status(400).json({ ok:false, error:'voter et buckets requis' });

  const others = session.votes.filter((v:any) => (v.voter||'').toLowerCase() !== String(voter).toLowerCase());
  const vote = { voter: String(voter), buckets, at: Date.now() };

  session.votes = [...others, vote];
  await setKV(`session:${code}`, session);

  res.status(200).json({ ok:true });
}
