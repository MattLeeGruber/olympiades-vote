import { createClient } from '@turso/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
});

async function getKV<T=any>(key: string): Promise<T|null> {
  const row = await db.execute("SELECT value FROM kv WHERE key = ?", [key]);
  if (!row.rows.length) return null;
  return JSON.parse(row.rows[0].value as string);
}

async function setKV(key: string, value: any) {
  await db.execute("INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)", [
    key,
    JSON.stringify(value)
  ]);
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
