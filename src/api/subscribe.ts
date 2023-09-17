import { handle } from '@hono/node-server/vercel';
import { kv } from '@vercel/kv';
import { Hono } from 'hono';
import { safeParse } from 'valibot';
import webpush from 'web-push';

import { PushSubscriptionSchema } from '##/domain/schema';

const app = new Hono().basePath('/api');

app.post('/subscribe', async (c) => {
  const body = (await c.req.json()) as unknown;
  const parsed = safeParse(PushSubscriptionSchema, body);
  if (!parsed.success) {
    c.status(400);
    return c.json(parsed.error);
  }
  const subscription = parsed.data;

  // 一度通知し、失敗したら登録しない
  try {
    await webpush.sendNotification(subscription);
  } catch (e) {
    // TODO: 通知に失敗したら subscription を削除する
    console.error(e);
    c.status(400);
    return c.text('Illegal subscription');
  }

  // TODO: 有効期限をつけておき、適度に更新させるようにする
  await kv.set(`subscriptions:${subscription.endpoint}`, subscription);

  c.status(200);
  return c.text('ok');
});

export default handle(app);
