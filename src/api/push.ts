import { kv } from '@vercel/kv';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { safeParse } from 'valibot';
import webpush from 'web-push';

import { PushSubscriptionSchema } from '##/domain/schema';

const app = new Hono().basePath('/api');

app.get('/push', async (c) => {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? '',
    process.env.VITE_VAPID_PUBLIC_KEY ?? '',
    process.env.VAPID_PRIVATE_KEY ?? '',
  );

  const keys = await kv.keys('subscriptions:*');
  let count = 0;
  for (const key of keys) {
    const value = await kv.get(key);
    const parsed = safeParse(PushSubscriptionSchema, value);
    if (!parsed.success) {
      console.warn(`invalid subscription: [${key}]`, value, parsed.error);
      await kv.del(key);
      continue;
    }
    const subscription = parsed.data;

    try {
      await webpush.sendNotification(subscription);
      count += 1;
    } catch (e) {
      // TODO: 通知に失敗したら subscription を削除する
      console.error(e);
    }
  }

  c.status(200);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return c.text(`push [${count}]`);
});

export default handle(app);
