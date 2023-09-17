import { kv } from '@vercel/kv';
import { safeParse } from 'valibot';

import { PushSubscriptionSchema } from './_schema.mjs';
import { webpush } from './_webpush.mjs';

export default async function handler(request, response) {
  const body = request.body;
  const parsed = safeParse(PushSubscriptionSchema, body);

  if (!parsed.success) {
    response.status(400).json(parsed.error);
    return;
  }

  const subscription = parsed.data;
  console.log(subscription);

  try {
    await webpush.sendNotification(subscription);
  } catch (e) {
    console.error(e);
    response.status(400).send('FAILD: Send notification');
    return;
  }

  // TODO: 有効期限をつけておき、適度に更新させるようにする
  try {
    await kv.set(`subscriptions:${subscription.endpoint}`, subscription);
  } catch (e) {
    console.error(e);
    response.status(500).send('FAILED: Save subscription');
    return;
  }

  response.status(201).send('');
}
