import { atom } from 'jotai';
import { withImmer } from 'jotai-immer';
import { DateTime, Duration } from 'luxon';
import { v4 as uuid } from 'uuid';

import {
  CompletedTasksMapper,
  SettingMapper,
  TaskSchedulesMapper,
  type NotificationSchedule,
  type TaskSchedule,
} from '##/domain/schema';
import { atomWithValidatedStorage } from '##/domain/util/storage';

const taskSchedulesAtom = atomWithValidatedStorage('taskSchedules', TaskSchedulesMapper, {});
const completedTasksAtom = atomWithValidatedStorage('completedTasks', CompletedTasksMapper, []);
const settingAtom = atomWithValidatedStorage('setting', SettingMapper, {
  notificationTime: Duration.fromISOTime('07:00'),
});
const todayAtom = atom(DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));

export type NewTaskSchedule = Omit<TaskSchedule, 'id'>;

export const createTaskScheduleAtom = atom(null, (_, set, taskSchedule: NewTaskSchedule) => {
  // TODO: taskSchedule のバリデーションがこのレイヤーでされていなくてよいか検討する
  // ちょっと微妙だが、toInput したあとに再度 parse することでバリデーションはできるはず
  // TODO: id についても再現可能にすべきか検討する
  const id = uuid();
  set(withImmer(taskSchedulesAtom), (draft) => {
    draft[id] = { id, ...taskSchedule };
  });

  return id;
});

export const updateTaskScheduleAtom = atom(null, (_, set, taskSchedule: TaskSchedule) => {
  // TODO: taskSchedule が登録済みであるかのチェック
  set(withImmer(taskSchedulesAtom), (draft) => {
    draft[taskSchedule.id] = taskSchedule;
  });
});

export const deleteTaskScheduleAtom = atom(null, (_, set, id: string) => {
  set(withImmer(taskSchedulesAtom), (draft) => {
    delete draft[id];
  });

  // TODO: 削除できたかを返す
});

export const completeTaskAtom = atom(null, (get, set, id: string, today: DateTime) => {
  const taskSchedule = get(taskSchedulesAtom)[id];
  if (taskSchedule === undefined) {
    throw new Error('index is out of range');
  }

  const completedTaskId = uuid();

  // 複数の Atom の更新が簡単に記述できるのは jotai の強み
  set(withImmer(completedTasksAtom), (draft) => {
    draft.push({
      id: completedTaskId,
      title: taskSchedule.title,
      scheduledDate: taskSchedule.nextDate,
      completedDate: today,
    });
  });

  // 次の予定日を計算する(曜日の指定がある場合は、その曜日になるまで進める)
  let nextDate = today.plus(taskSchedule.interval);
  if (taskSchedule.weekday !== undefined) {
    while (nextDate.weekday !== taskSchedule.weekday) {
      nextDate = nextDate.plus({ days: 1 });
    }
  }

  set(withImmer(taskSchedulesAtom), (draft) => {
    draft[id]!.nextDate = nextDate;
  });

  return completedTaskId;
});

// TODO: なぜかこちらは最初のもの以外は taskSchedule が更新されない(completedTasks は追加される)
export const completeTasksAtom = atom(null, (_, set, ids: string[]) => {
  // LocalStorage に保存する際に、時刻は切り捨てられているが、念のためここでも切り捨てておく
  const today = DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  return ids.map((id) => set(completeTaskAtom, id, today));
});

export const updateTodayAtom = atom(null, (get, set) => {
  const today = DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  if (get(todayAtom) < today) {
    set(todayAtom, today);
  }
});

export const selectAllTaskSchedulesAtom = atom((get) => Object.values(get(taskSchedulesAtom)));

// TODO: 引数の指定の仕方を検討する

// atom の結果として関数を返す版
export const taskScheduleSelectorAtom = atom((get) => {
  return (id: string) => get(taskSchedulesAtom)[id];
});

// 先に引数を渡した関数を実行し、その結果としてひとつの要素の atom が返る版
// こちらは利用時に memo 化する必要があるはず
export function selectOneTaskSchedule(id: string) {
  return atom((get) => get(taskSchedulesAtom)[id]);
}

export const selectTodoTasksAtom = atom((get) => {
  const taskSchedules = get(taskSchedulesAtom);
  const today = get(todayAtom);

  return Object.values(taskSchedules)
    .filter((taskSchedule) => taskSchedule.nextDate <= today)
    .sort((a, b) => {
      if (a.nextDate < b.nextDate) {
        return -1;
      } else if (b.nextDate < a.nextDate) {
        return 1;
      }
      return 0;
    });
});

export const selectCompletedTasksAtom = atom((get) => get(completedTasksAtom));

export const selectNotificationScheduleAtom = atom((get) => {
  const { notificationTime } = get(settingAtom);
  const taskSchedules = get(taskSchedulesAtom);

  const result: NotificationSchedule = {};

  for (const taskSchedule of Object.values(taskSchedules)) {
    const notificationDateTime = taskSchedule.nextDate.plus(notificationTime).toISO() ?? '';
    if (result[notificationDateTime] === undefined) {
      result[notificationDateTime] = [];
    }
    result[notificationDateTime]!.push({
      id: taskSchedule.id,
      title: taskSchedule.title,
    });
  }

  return result;
});
