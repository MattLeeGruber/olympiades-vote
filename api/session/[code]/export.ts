// api/session/[code]/export.ts
import { createClient } from "@libsql/client";

function db() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });
}

async function getKV<T = any>(k: string) {
  const r = await db().execute({ sql: "SELECT value FROM kv WHERE key = ?", args: [k] });
  if (!r.rows.length) return null;
  return JSON.parse(r.rows[0].value as string);
}

// ... mêmes imports et getKV ...

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const code = String(req.query.code || "").trim();
    const admin = String(req.query.admin || req.headers["x-admin"] || "").trim();
    const s = await getKV<any>(`session:${code}`);
    if (!s) return res.status(404).send("Session inconnue");

    // ✅ PIN: session PIN OU ADMIN_PIN global
    const expected = String(s.adminPin || "").trim();
    const globalPin = String(process.env.ADMIN_PIN || "").trim();
    const okAdmin = admin && (admin === expected || (globalPin && admin === globalPin));
    if (!okAdmin) return res.status(403).send("Accès refusé");

    const rows = [["voter","bucket","key"]];
    for (const v of (s.votes || [])) {
      for (const k of ["incontournable","chaud","avoir","non"] as const) {
        for (const key of (v.buckets?.[k] || [])) rows.push([v.voter, k, key]);
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
