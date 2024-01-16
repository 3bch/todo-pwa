import { Redis } from '@upstash/redis';
import { safeParse } from 'valibot';

import { TaskSchedulesSchema } from './_schema.mjs';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(request, response) {
  const data = await kv.get('data:backup');

  const parsed = safeParse(TaskSchedulesSchema, data);
  if (!parsed.success) {
    console.warn('invalid backup data', parsed.error);
    response.status(400).json(parsed.error);
    return;
  }

  const schedules = parsed.data;
  const result = Object.fromEntries(schedules.map((s) => [s.id, s]));
  response.status(200).send(JSON.stringify(result));
}
