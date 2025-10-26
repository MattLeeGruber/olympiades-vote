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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = (req.query.code as string) || '';

  const s = await getKV<any>(`session:${code}`);
  if (!s) return res.status(404).json({ ok:false, error:'Session inconnue' });

  const tally: Record<string, Record<string, number>> = {
    incontournable:{}, chaud:{}, avoir:{}, non:{}
  };

  for (const v of s.votes) {
    for (const k of ["incontournable","chaud","avoir","non"]) {
      for (const key of (v.buckets[k] || [])) {
        tally[k][key] = (tally[k][key] || 0) + 1;
      }
    }
  }

  res.status(200).json({
    ok:true,
    selectedIds: s.selectedIds,
    votes: s.votes.length,
    tally
  });
}
