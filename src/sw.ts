import { DateTime } from 'luxon';
import type { Output } from 'valibot';
import { is } from 'valibot';
import { precacheAndRoute } from 'workbox-precaching';

import { TimerStateSchema } from './timer';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// やるべきこと
// 1. interval で定期的に現在時刻を確認する
// 2. 現在時刻がタスクの通知時刻を過ぎていたら通知を送り、タスクを積み残しリストに登録する

let timerState: Output<typeof TimerStateSchema> = [
  {
    id: '1',
    title: 'タスク1',
    dateTime: '2023-08-22T21:10:00+09:00',
  },
];

self.addEventListener('message', (event) => {
  if (is(TimerStateSchema, event.data)) {
    timerState = event.data;
  }
});

const INTERVAL = 1000 * 60 * 5;

setInterval(async () => {
  const now = DateTime.now();

  for (const task of timerState) {
    if (DateTime.fromISO(task.dateTime) <= now) {
      void self.registration.showNotification(task.title, {
        body: `${task.dateTime} に通知を送りました。`,
      });
    }
  }

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage('update');
  });
}, INTERVAL);
