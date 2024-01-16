import { Redis } from '@upstash/redis';
import {
  array,
  integer,
  maxValue,
  minValue,
  number,
  object,
  optional,
  safeParse,
  string,
} from 'valibot';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const TaskScheduleSchema = object({
  id: string(),
  title: string(),
  nextDate: string(),
  interval: DurationSchema,
  weekday: optional(number([integer(), minValue(1), maxValue(7)])),
});

const TaskSchedulesSchema = array(TaskScheduleSchema);

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
