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
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const code = String(req.query.code || "").trim();
    const s = await getKV<any>(`session:${code}`);
    if (!s) return res.status(404).send("Session inconnue");

    const rows = [["voter","bucket","key"]];
    for (const v of (s.votes || [])) {
      for (const k of ["incontournable","chaud","avoir","non"] as const) {
        for (const key of (v.buckets?.[k] || [])) {
          rows.push([v.voter, k, key]);
        }
      }
    }

    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type","text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="results-${code}.csv"`);
    res.send(csv);
  } catch (e:any) {
    res.status(500).send(e?.message || String(e));
  }
}
