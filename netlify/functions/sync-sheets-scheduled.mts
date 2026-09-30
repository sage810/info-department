/** 10분마다 시트 → DB 동기화 (Netlify Scheduled Function). 주기는 schedule 값을 바꾸면 된다. */
import type { Config } from '@netlify/functions';
import { runSync } from '../lib/sync.mts';

export default async () => {
  try {
    const r = await runSync();
    console.log('sync ok', JSON.stringify(r.summary));
  } catch (e: any) {
    console.error('sync failed', e.message);
  }
  return new Response('ok');
};

export const config: Config = { schedule: '*/10 * * * *' };
