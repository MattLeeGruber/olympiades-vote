async function getKV<T=any>(key: string): Promise<T|null> {
  const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  if (!r.ok) return null;
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function setKV(key: string, value: any) {
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(value)
  });
}
import type { VercelRequest, VercelResponse } from '@vercel/node'

const WORDS = ["SPARTIATE","PHENIX","SCORPION","HYDRE","CENTAURE","CYCLOPE","MANTICORE","CERBERE","PEGASE","HARPYE"];
const genCode = () => `${WORDS[Math.floor(Math.random()*WORDS.length)]}-${100+Math.floor(Math.random()*900)}`;

async function getKV<T=any>(key: string): Promise<T|null> {
  const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  if (!r.ok) return null;
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function setKV(key: string, value: any) {
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify(value)
  });
}

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
