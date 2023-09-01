import { createStore } from 'jotai';

import { selectNotificationScheduleAtom } from '##/domain/atom';

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

  return store;
}
