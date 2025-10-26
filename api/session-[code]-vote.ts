async function getKV<T=any>(key: string): Promise<T|null> {
  const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  if (!r.ok) return null;
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function setKV(key: string, value: any) {
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(value)
  });
}
import type { VercelRequest, VercelResponse } from '@vercel/node'

async function getKV<T=any>(key: string): Promise<T|null> {
  const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  if (!r.ok) return null;
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function setKV(key: string, value: any) {
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(value)
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
