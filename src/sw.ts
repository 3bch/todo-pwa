import { get, set } from 'idb-keyval';
import { DateTime } from 'luxon';
import { array, safeParse } from 'valibot';
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

import { TaskScheduleSchema } from '##/domain/schema';

declare let self: ServiceWorkerGlobalScope;

clientsClaim();

self.addEventListener('install', () => {
  void self.skipWaiting();
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const MessageSchema = array(TaskScheduleSchema);

self.addEventListener('message', (event) => {
  const parsed = safeParse(MessageSchema, event.data);
  if (!parsed.success) {
    console.error('ServiceWorker: Invalid message', parsed.error);
    return;
  }

  // IndexedDB には変換前のデータで保存する
  event.waitUntil(set('schedules', event.data));
});

async function notify() {
  const data = await get<unknown>('schedules');
  const parsed = safeParse(MessageSchema, data);
  if (!parsed.success) {
    console.error('ServiceWorker: Invalid IndexedDB data', parsed.error);
    return;
  }

  const today = DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const tomorrow = today.plus({ days: 1 });

  const schedules = parsed.data;
  const titles = schedules
    .filter((schedule) => {
      return today <= schedule.nextDate && schedule.nextDate < tomorrow;
    })
    .map((schedule) => schedule.title);

  if (0 < titles.length) {
    await self.registration.showNotification('今日のタスク', {
      body: titles.join(', '),
    });
  } else {
    await self.registration.showNotification('今日のタスクはありません');
  }

  const subscription = await self.registration.pushManager.getSubscription();
  await self.fetch('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await self.fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: subscription?.endpoint,
      titles,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

self.addEventListener('push', (event) => {
  event.waitUntil(notify());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const open = async () => {
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      const url = new URL(client.url);
      if (url.pathname === '/') {
        await client.focus();
        return;
      }
    }
    await self.clients.openWindow('/');
  };
  event.waitUntil(open());
});
