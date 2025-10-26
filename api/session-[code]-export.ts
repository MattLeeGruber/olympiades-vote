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
