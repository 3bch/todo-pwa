import { createStore } from 'jotai';
import { DateTime, Duration } from 'luxon';

import {
  completeTasksAtom,
  createTaskScheduleAtom,
  selectCompletedTasksAtom,
  taskScheduleSelectorAtom,
} from '##/domain/atom';

afterEach(() => {
  localStorage.clear();
});

describe('createTaskScheduleAtom', () => {
  test('TaskSchedule を新規作成できる', () => {
    const store = createStore();
    const nextDate = DateTime.fromISO('2023-09-01');
    const newTaskSchedule = {
      title: 'test task',
      nextDate: nextDate,
      interval: Duration.fromObject({ days: 7 }),
    };
    const id = store.set(createTaskScheduleAtom, newTaskSchedule);

    const selector = store.get(taskScheduleSelectorAtom);
    const actual = selector(id);

    expect(actual).toStrictEqual({
      id,
      title: 'test task',
      nextDate,
      interval: Duration.fromObject({ days: 7 }),
      weekday: undefined,
    });
  });
});

describe('completeTaskAtom', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('TaskSchedule を予定通りに完了した場合', () => {
    const store = createStore();
    const nextDate = DateTime.fromISO('2023-09-01');
    const newTaskSchedule = {
      title: 'test task',
      nextDate: nextDate,
      interval: Duration.fromObject({ days: 7 }),
    };
    const id = store.set(createTaskScheduleAtom, newTaskSchedule);

    jest.useFakeTimers({ now: DateTime.fromISO('2023-09-01').toMillis() });
    const [completedId] = store.set(completeTasksAtom, [id]);

    const selector = store.get(taskScheduleSelectorAtom);
    const actual = selector(id);

    expect(actual).toStrictEqual({
      id,
      title: 'test task',
      nextDate: DateTime.fromISO('2023-09-08'),
      interval: Duration.fromObject({ days: 7 }),
      weekday: undefined,
    });

    const completedTasks = store.get(selectCompletedTasksAtom);
    expect(completedTasks).toStrictEqual([
      {
        id: completedId,
        title: 'test task',
        scheduledDate: DateTime.fromISO('2023-09-01'),
        completedDate: DateTime.fromISO('2023-09-01'),
      },
    ]);
  });

  test('TaskSchedule を予定より遅れて完了した場合', () => {
    const store = createStore();
    const nextDate = DateTime.fromISO('2023-09-01');
    const newTaskSchedule = {
      title: 'test task',
      nextDate: nextDate,
      interval: Duration.fromObject({ days: 7 }),
    };
    const id = store.set(createTaskScheduleAtom, newTaskSchedule);

    jest.useFakeTimers({ now: DateTime.fromISO('2023-09-02').toMillis() });
    const [completedId] = store.set(completeTasksAtom, [id]);

    const selector = store.get(taskScheduleSelectorAtom);
    const actual = selector(id);

    expect(actual).toStrictEqual({
      id,
      title: 'test task',
      nextDate: DateTime.fromISO('2023-09-09'), // 次の予定は遅れている分だけずれる
      interval: Duration.fromObject({ days: 7 }),
      weekday: undefined,
    });

    const completedTasks = store.get(selectCompletedTasksAtom);
    expect(completedTasks).toStrictEqual([
      {
        id: completedId,
        title: 'test task',
        scheduledDate: DateTime.fromISO('2023-09-01'),
        completedDate: DateTime.fromISO('2023-09-02'),
      },
    ]);
  });

  test('TaskSchedule に weekday が設定されていた場合', () => {
    const store = createStore();
    const nextDate = DateTime.fromISO('2023-09-01');
    const newTaskSchedule = {
      title: 'test task',
      nextDate: nextDate,
      interval: Duration.fromObject({ days: 7 }),
      weekday: 3, // 水曜日
    };
    const id = store.set(createTaskScheduleAtom, newTaskSchedule);

    jest.useFakeTimers({ now: DateTime.fromISO('2023-09-02').toMillis() });
    const [completedId] = store.set(completeTasksAtom, [id]);

    const selector = store.get(taskScheduleSelectorAtom);
    const actual = selector(id);

    expect(actual).toEqual({
      id,
      title: 'test task',
      nextDate: DateTime.fromISO('2023-09-13'), // 7日後以降の最初の水曜日
      interval: Duration.fromObject({ days: 7 }),
      weekday: 3,
    });

    const completedTasks = store.get(selectCompletedTasksAtom);
    expect(completedTasks).toStrictEqual([
      {
        id: completedId,
        title: 'test task',
        scheduledDate: DateTime.fromISO('2023-09-01'),
        completedDate: DateTime.fromISO('2023-09-02'),
      },
    ]);
  });
});
