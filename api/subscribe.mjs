import { Redis } from '@upstash/redis';
import { safeParse } from 'valibot';

import { PushSubscriptionSchema } from './_schema.mjs';

// 期限は 5 日
const SUBSCRIPTION_EXPIRE = 60 * 60 * 24 * 5;

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(request, response) {
  const body = request.body;
  const parsed = safeParse(PushSubscriptionSchema, body);

  if (!parsed.success) {
    response.status(400).json(parsed.error);
    return;
  }

  const subscription = parsed.data;
  console.log('save subscription', subscription);

  try {
    await kv.set(`subscriptions:${subscription.endpoint}`, subscription, {
      ex: SUBSCRIPTION_EXPIRE,
    });
  } catch (e) {
    console.error(e);
    response.status(500).send('FAILED: Save subscription');
    return;
  }

  response.status(201).send('');
}
