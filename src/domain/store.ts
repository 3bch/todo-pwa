import { createStore } from 'jotai';
import { Duration } from 'luxon';
import { type Input } from 'valibot';

import { selectAllTaskSchedulesAtom, updateTodayAtom } from '##/domain/atom';
import { toInputFromTaskSchedule, type TaskScheduleSchema } from '##/domain/schema';

const INTERVAL = Duration.fromObject({
  minutes: 5,
});

async function backup(schedules: Array<Input<typeof TaskScheduleSchema>>) {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription === null) {
    return;
  }

  await fetch('/api/backup', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      schedules,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function createDomainStore() {
  const store = createStore();

  void navigator.serviceWorker.ready.then((registration) => {
    const schedules = store.get(selectAllTaskSchedulesAtom);
    registration.active?.postMessage(schedules.map(toInputFromTaskSchedule));
  });

  store.sub(selectAllTaskSchedulesAtom, () => {
    const schedules = store.get(selectAllTaskSchedulesAtom);
    const schedulesInput = schedules.map(toInputFromTaskSchedule);
    navigator.serviceWorker.controller?.postMessage(schedulesInput);
    void backup(schedulesInput);
  });

  // 日の変更を検知するために、定期的に updateTodayAtom を呼び出す
  setInterval(() => {
    store.set(updateTodayAtom);
  }, INTERVAL.toMillis());

  return store;
}
