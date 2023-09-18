import { DateTime } from 'luxon';
import { array, safeParse } from 'valibot';
import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

import { TaskScheduleSchema, type TaskSchedule } from '##/domain/schema';

declare let self: ServiceWorkerGlobalScope;

clientsClaim();

self.addEventListener('install', () => {
  void self.skipWaiting();
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

let schedules: TaskSchedule[] = [];

const MessageSchema = array(TaskScheduleSchema);

self.addEventListener('message', (event) => {
  const parsed = safeParse(MessageSchema, event.data);
  if (!parsed.success) {
    console.error('ServiceWorker: invalid message', parsed.error);
    return;
  }

  schedules = parsed.data;
});

self.addEventListener('push', (event) => {
  const today = DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const titles = [];

  for (const schedule of schedules) {
    if (schedule.nextDate.diff(today).days < 1) {
      titles.push(schedule.title);
    }
  }

  console.log('notification', titles);

  event.waitUntil(self.registration.showNotification(`今日のタスク: ${titles.join(',')}`));

  const keepSubscription = async () => {
    const subscription = await self.registration.pushManager.getSubscription();
    await self.fetch('/api/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  event.waitUntil(keepSubscription());
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
