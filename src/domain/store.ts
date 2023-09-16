import { createStore } from 'jotai';
import { Duration } from 'luxon';

import { selectNotificationScheduleAtom, updateTodayAtom } from '##/domain/atom';

const INTERVAL = Duration.fromObject({
  minutes: 5,
});

export function createDomainStore() {
  const store = createStore();

  // TODO: ServiceWorker が再インストールされたときに最新の予定が配信されていないかも
  void navigator.serviceWorker.ready.then((registration) => {
    // ServiceWorker が有効になったら最新の状態を送る
    registration.active?.postMessage(store.get(selectNotificationScheduleAtom));

    // 状態が更新されるごとに ServiceWorker に状態を送る
    store.sub(selectNotificationScheduleAtom, () => {
      registration.active?.postMessage(store.get(selectNotificationScheduleAtom));
    });
  });

  // 日の変更を検知するために、定期的に updateTodayAtom を呼び出す
  setInterval(() => {
    store.set(updateTodayAtom);
  }, INTERVAL.toMillis());

  return store;
}
