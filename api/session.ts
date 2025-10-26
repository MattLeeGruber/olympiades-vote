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

const WORDS = ["SPARTIATE","PHENIX","SCORPION","HYDRE","CENTAURE","CYCLOPE","MANTICORE","CERBERE","PEGASE","HARPYE"];
const genCode = () => `${WORDS[Math.floor(Math.random()*WORDS.length)]}-${100+Math.floor(Math.random()*900)}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method Not Allowed' });

  const { selectedIds = [], theme = 'bronze' } = req.body || {};
  const code = genCode();

  const session = {
    code,
    theme,
    selectedIds,
    createdAt: Date.now(),
    votes: [] as any[]
  };

  await setKV(`session:${code}`, session);
  res.status(200).json({ ok:true, code, url:`/join/${code}` });
}
