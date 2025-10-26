// api/session/[code]/results.ts
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
  if (req.method !== "GET") return res.status(405).json({ ok:false, error:"Method Not Allowed" });

  try {
    const code = String(req.query.code || "").trim();
    const admin = String(req.query.admin || req.headers["x-admin"] || "").trim();
    const s = await getKV<any>(`session:${code}`);
    if (!s) return res.status(404).json({ ok:false, error:"Session inconnue" });

    // ✅ PIN: on accepte soit le PIN stocké pour la session, soit ADMIN_PIN global
    const expected = String(s.adminPin || "").trim();
    const globalPin = String(process.env.ADMIN_PIN || "").trim();
    const okAdmin = admin && (admin === expected || (globalPin && admin === globalPin));
    if (!okAdmin) return res.status(403).json({ ok:false, error:"Accès refusé" });

    const tally: Record<string, Record<string, number>> = {
      incontournable: {}, chaud: {}, avoir: {}, non: {}
    };

    for (const v of (s.votes || [])) {
      for (const k of ["incontournable","chaud","avoir","non"] as const) {
        for (const key of (v.buckets?.[k] || [])) {
          tally[k][key] = (tally[k][key] || 0) + 1;
        }
      }
    }

    res.status(200).json({
      ok: true,
      selectedIds: s.selectedIds,
      votes: (s.votes || []).length,
      tally
    });
  } catch (e:any) {
    res.status(500).json({ ok:false, error:e?.message || String(e) });
  }
}
