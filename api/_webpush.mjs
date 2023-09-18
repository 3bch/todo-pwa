import push from 'web-push';

push.setVapidDetails(
  process.env.VAPID_SUBJECT ?? '',
  process.env.VITE_VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? '',
);

export const webpush = push;
