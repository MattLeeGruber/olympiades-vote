// api/session/[code]/results.ts
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
function weightsFromQuery(q:any){
  const w = {
    incontournable: Number(q.wIncont ?? 3),
    chaud:          Number(q.wChaud  ?? 2),
    avoir:          Number(q.wAvoir  ?? 1),
    non:            Number(q.wNon    ?? 0),
  };
  // garde des bornes raisonnables
  for(const k of Object.keys(w) as (keyof typeof w)[]) {
    if (Number.isNaN(w[k])) w[k] = 0 as any;
  }
  return w;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ ok:false, error:"Method Not Allowed" });

  try {
    const code = String(req.query.code || "").trim();
    const admin = String(req.query.admin || req.headers["x-admin"] || "").trim();
    const s = await getKV<any>(`session:${code}`);
    if (!s) return res.status(404).json({ ok:false, error:"Session inconnue" });

    const expected = String(s.adminPin || "").trim();
    const globalPin = String(process.env.ADMIN_PIN || "").trim();
    const okAdmin = admin && (admin === expected || (globalPin && admin === globalPin));
    if (!okAdmin) return res.status(403).json({ ok:false, error:"Accès refusé" });

    // Tally brut
    const tally: Record<string, Record<string, number>> = { incontournable:{}, chaud:{}, avoir:{}, non:{} };
    for (const v of (s.votes || [])) {
      for (const bucket of ["incontournable","chaud","avoir","non"] as const) {
        for (const key of (v.buckets?.[bucket] || [])) {
          tally[bucket][key] = (tally[bucket][key] || 0) + 1;
        }
      }
    }

    // Enrichissement + scores
    const weights = weightsFromQuery(req.query);
    type Row = {
      id: string; mode: "normal"|"hardcore";
      name: string; categorie: string; duree: string;
      incontournable: number; chaud: number; avoir: number; non: number;
      total: number; score: number; // score pondéré
    };
    const rowsMap = new Map<string, Row>();

    function upsert(key:string, bucket:"incontournable"|"chaud"|"avoir"|"non", count:number){
      const {id,mode} = parseKey(key);
      const cat = CATALOG[id];
      const k = `${id}__${mode}`;
      const r = rowsMap.get(k) || {
        id, mode,
        name: cat?.name || id,
        categorie: cat?.categorie || "",
        duree: cat?.duree || "",
        incontournable: 0, chaud: 0, avoir: 0, non: 0,
        total: 0, score: 0
      };
      r[bucket] += count;
      r.total += count;
      rowsMap.set(k, r);
    }

    for(const [bucket, obj] of Object.entries(tally) as any){
      for(const [key, count] of Object.entries(obj as Record<string,number>)){
        upsert(key, bucket, count);
      }
    }

    const rows = Array.from(rowsMap.values()).map(r => {
      r.score = r.incontournable*weights.incontournable + r.chaud*weights.chaud + r.avoir*weights.avoir + r.non*weights.non;
      return r;
    });

    const totalVotes = (s.votes || []).length;

    // Classements
    const byScore = [...rows].sort((a,b)=> b.score - a.score);
    const top = {
      global: byScore.slice(0,10),
      incontournable: [...rows].sort((a,b)=> b.incontournable - a.incontournable).slice(0,10),
      chaud:          [...rows].sort((a,b)=> b.chaud - a.chaud).slice(0,10),
      avoir:          [...rows].sort((a,b)=> b.avoir - a.avoir).slice(0,10),
      non:            [...rows].sort((a,b)=> b.non - a.non).slice(0,10),
    };

    res.status(200).json({
      ok: true,
      session: { code: s.code, createdAt: s.createdAt, selectedIds: s.selectedIds },
      votes: totalVotes,
      weights,
      rows,   // tableau exploitable (une ligne par (épreuve,mode))
      top     // les tops déjà calculés
    });

  } catch (e:any) {
    res.status(500).json({ ok:false, error:e?.message || String(e) });
  }
}
