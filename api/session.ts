// api/session.ts
import { createClient } from "@libsql/client";

function db() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });
}

async function ensureTable() {
  await db().execute(`
    CREATE TABLE IF NOT EXISTS kv (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

async function setKV(key: string, value: any) {
  await db().execute({
    sql: "INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)",
    args: [key, JSON.stringify(value)],
  });
}

const WORDS = ["SPARTIATE","PHENIX","SCORPION","HYDRE","CENTAURE","CYCLOPE","MANTICORE","CERBERE","PEGASE","HARPYE"];
const genCode = () => `${WORDS[Math.floor(Math.random()*WORDS.length)]}-${100+Math.floor(Math.random()*900)}`;

async function readBody(req: any) {
  try {
    if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const chunks: Uint8Array[] = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString("utf8");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method Not Allowed" });

  try {
    await ensureTable();

    const body = await readBody(req);
    const { selectedIds = [], theme = "bronze" } = body || {};

    // 👉 On accepte le PIN soit depuis le body, soit depuis l'env ADMIN_PIN
    const adminPin = String((body?.adminPin ?? process.env.ADMIN_PIN ?? "")).trim();

    if (!Array.isArray(selectedIds)) {
      return res.status(400).json({ ok:false, error:"selectedIds doit être un tableau" });
    }
    if (!adminPin) {
      return res.status(400).json({ ok:false, error:"adminPin requis (body.adminPin ou variable Vercel ADMIN_PIN)" });
    }

    const code = genCode();
    const session = {
      code,
      theme,
      selectedIds,
      adminPin,            // on stocke le PIN animateur
      createdAt: Date.now(),
      votes: [] as any[],
      closed: false
    };

    await setKV(`session:${code}`, session);
    return res.status(200).json({ ok:true, code, url:`/join/${code}` });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
