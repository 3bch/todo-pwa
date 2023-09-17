import { kv } from '@vercel/kv';
import { safeParse } from 'valibot';

import { PushSubscriptionSchema } from './_schema.mjs';
import { webpush } from './_webpush.mjs';

export default async function handler(request, response) {
  const keys = await kv.keys('subscriptions:*');

  let count = 0;
  for (const key of keys) {
    const value = await kv.get(key);
    const parsed = safeParse(PushSubscriptionSchema, value);
    if (!parsed.success) {
      console.warn(`invalid subscription: [${key}]`, parsed.error);
      await kv.del(key);
      continue;
    }
    const subscription = parsed.data;

    try {
      await webpush.sendNotification(subscription);
      console.info(`push: [${key}]`);
      count += 1;
    } catch (e) {
      console.error(e);
      await kv.del(key);
    }
  }

  response.status(200).send(`push count: ${count}`);
}
