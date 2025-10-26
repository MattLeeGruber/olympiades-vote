import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv';

async function getKV<T=any>(key: string): Promise<T|null> {
  return (await kv.get(key)) as T | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = (req.query.code as string) || '';

  const s = await getKV<any>(`session:${code}`);
  if (!s) return res.status(404).send("Session inconnue");

  const rows = [["voter","bucket","key"]];
  for (const v of s.votes) {
    for (const k of ["incontournable","chaud","avoir","non"]) {
      for (const key of (v.buckets[k] || [])) {
        rows.push([v.voter, k, key]);
      }
    }
  }

  const csv = rows
    .map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type","text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="results-${code}.csv"`);
  res.send(csv);
}
