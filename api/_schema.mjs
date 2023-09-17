import { object, string } from 'valibot';

export const PushSubscriptionSchema = object({
  endpoint: string(),
  keys: object({
    auth: string(),
    p256dh: string(),
  }),
});
