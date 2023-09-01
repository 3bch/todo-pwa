import { DateTime, Duration } from 'luxon';
import { safeParse } from 'valibot';
import { precacheAndRoute } from 'workbox-precaching';

import { NotificationSchedulesMapper, type NotificationSchedule } from '##/domain/schema';

declare let self: ServiceWorkerGlobalScope;

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
