import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv';

async function getKV<T=any>(key: string): Promise<T|null> {
  return (await kv.get(key)) as T | null;
}
async function setKV(key: string, value: any) {
  await kv.set(key, value);
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
