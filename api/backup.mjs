import { Redis } from '@upstash/redis';
import { safeParse } from 'valibot';

import { BackupSchema } from './_schema.mjs';

// 期限は 60 日
const BACKUP_EXPIRE = 60 * 60 * 24 * 60;

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(request, response) {
  const body = request.body;
  const parsed = safeParse(BackupSchema, body);

  if (!parsed.success) {
    console.warn('invalid backup', parsed.error);
    response.status(400).json(parsed.error);
    return;
  }

  const { endpoint, schedules } = parsed.data;
  console.log(`backup ${endpoint}: [${schedules.length}] schedules`);

  await kv.set(`backup:${endpoint}`, schedules, {
    ex: BACKUP_EXPIRE,
  });

  response.status(201).send('');
}
