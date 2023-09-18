import { createStore } from 'jotai';
import { Duration } from 'luxon';

import { selectAllTaskSchedulesAtom, updateTodayAtom } from '##/domain/atom';
import { toInputFromTaskSchedule } from '##/domain/schema';

const INTERVAL = Duration.fromObject({
  minutes: 5,
});

export function createDomainStore() {
  const store = createStore();

  void navigator.serviceWorker.ready.then((registration) => {
    const schedules = store.get(selectAllTaskSchedulesAtom);
    registration.active?.postMessage(schedules.map(toInputFromTaskSchedule));
  });

  store.sub(selectAllTaskSchedulesAtom, () => {
    const schedules = store.get(selectAllTaskSchedulesAtom);
    navigator.serviceWorker.controller?.postMessage(schedules.map(toInputFromTaskSchedule));
  });

  // 日の変更を検知するために、定期的に updateTodayAtom を呼び出す
  setInterval(() => {
    store.set(updateTodayAtom);
  }, INTERVAL.toMillis());

  return store;
}
