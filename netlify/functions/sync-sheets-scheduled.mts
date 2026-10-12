/**
 * 10분마다 시트 → DB 동기화를 **시작**한다(Netlify Scheduled Function). 주기는 schedule 값을 바꾸면 된다.
 * 예약 함수도 제한 시간이 짧아 직접 돌리지 않고, 기록을 만든 뒤 백그라운드 함수(sync-sheets-background)에 넘긴다.
 */
import type { Config } from '@netlify/functions';
import { adminClient } from '../lib/supabase-admin.mts';
import { startSync, siteOrigin } from '../lib/sync-start.mts';

export default async (req: Request) => {
  try {
    const r = await startSync(adminClient(), { trigger: 'schedule', origin: siteOrigin(req) });
    console.log('running' in r ? `sync already running (#${r.running})` : `sync started (#${r.runId})`);
  } catch (e: any) {
    console.error('sync start failed', e.message);
  }
  return new Response('ok');
};

export const config: Config = { schedule: '*/10 * * * *' };
