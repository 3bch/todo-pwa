import { DateTime, Duration } from 'luxon';
import { safeParse } from 'valibot';
import { clientsClaim, skipWaiting } from 'workbox-core';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

import { NotificationSchedulesMapper, type NotificationSchedule } from '##/domain/schema';

declare let self: ServiceWorkerGlobalScope;

// Workbox によって適切なイベントハンドラが自動的に登録されるため、トップレベルで呼び出してよい
skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const INTERVAL = Duration.fromObject({
  minutes: 5,
});

let notificationSchedule: NotificationSchedule = {};
let prevDateTime = DateTime.now();

self.addEventListener('message', (event) => {
  const result = safeParse(NotificationSchedulesMapper.schema, event.data);
  if (!result.success) {
    console.warn('IGNORE: Illegal Message', result.error, event.data);
    return;
  }

  notificationSchedule = result.data;
});

// TODO: 本当は Push API を利用しないと適切に通知できないらしい
setInterval(() => {
  const now = DateTime.now();

  for (const [dateTime, tasks] of Object.entries(notificationSchedule)) {
    const scheduled = DateTime.fromISO(dateTime);
    if (prevDateTime < scheduled && scheduled <= now) {
      const message = tasks.join(', ');
      void self.registration.showNotification('本日のタスクの通知', {
        body: message,
      });
    }
  }

  prevDateTime = now;
}, INTERVAL.toMillis());
