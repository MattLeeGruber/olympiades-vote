// api/session/[code]/export.ts
import { createClient } from "@libsql/client";
import { CATALOG } from "../../_catalog";

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
function parseKey(key:string){
  const m = key.match(/^(.*)-(normal|hardcore)$/);
  if(!m) return { id:key, mode:"normal" as const };
  return { id:m[1], mode:m[2] as "normal"|"hardcore" };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const code = String(req.query.code || "").trim();
    const admin = String(req.query.admin || req.headers["x-admin"] || "").trim();
    const s = await getKV<any>(`session:${code}`);
    if (!s) return res.status(404).send("Session inconnue");

    const expected = String(s.adminPin || "").trim();
    const globalPin = String(process.env.ADMIN_PIN || "").trim();
    const okAdmin = admin && (admin === expected || (globalPin && admin === globalPin));
    if (!okAdmin) return res.status(403).send("Accès refusé");

    const rows = [["session","voter","bucket","key","id","mode","name","categorie","duree","at"]];
    for (const v of (s.votes || [])) {
      for (const k of ["incontournable","chaud","avoir","non"] as const) {
        for (const key of (v.buckets?.[k] || [])) {
          const {id,mode} = parseKey(key);
          const cat = CATALOG[id];
          rows.push([
            s.code,
            v.voter,
            k,
            key,
            id,
            mode,
            cat?.name || id,
            cat?.categorie || "",
            cat?.duree || "",
            v.at || ""
          ]);
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
