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

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ ok:false });

  try {
    const code = String(req.query.code || "").trim();
    const s = await getKV<any>(`session:${code}`);
    if (!s) return res.status(404).json({ ok:false, error:"Session inconnue" });

    const tally: Record<string, Record<string, number>> = {
      incontournable:{}, chaud:{}, avoir:{}, non:{}
    };

    for (const v of (s.votes || [])) {
      for (const k of ["incontournable","chaud","avoir","non"] as const) {
        for (const key of (v.buckets?.[k] || [])) {
          tally[k][key] = (tally[k][key] || 0) + 1;
        }
      }
    }

    res.status(200).json({ ok:true, selectedIds: s.selectedIds, votes: (s.votes||[]).length, tally });
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
