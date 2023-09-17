import { createStore } from 'jotai';
import { DateTime, Duration } from 'luxon';

import { selectAllTaskSchedulesAtom, updateTodayAtom } from '##/domain/atom';

const INTERVAL = Duration.fromObject({
  minutes: 5,
});

export function createDomainStore() {
  const store = createStore();

  navigator.serviceWorker.addEventListener('message', () => {
    const today = DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const schedules = store.get(selectAllTaskSchedulesAtom);

    if (Notification.permission === 'granted') {
      const todaySchedules = schedules.filter(
        (schedule) => schedule.nextDate.diff(today).days === 0,
      );
      new Notification('本日のタスク', {
        body: todaySchedules.map((schedule) => schedule.title).join(', '),
      });
    }

    store.set(updateTodayAtom);
  });

  // 日の変更を検知するために、定期的に updateTodayAtom を呼び出す
  setInterval(() => {
    store.set(updateTodayAtom);
  }, INTERVAL.toMillis());

  return store;
}
