import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv';

async function getKV<T=any>(key: string): Promise<T|null> {
  return (await kv.get(key)) as T | null;
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
