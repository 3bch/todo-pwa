import { createStore } from 'jotai';
import { DateTime, Duration } from 'luxon';

import { createTaskScheduleAtom, taskScheduleSelectorAtom } from '#/domain/atom';

describe('domain/atom', () => {
  describe('createTaskScheduleAtom', () => {
    test('TaskSchedule を新規作成できる', () => {
      const store = createStore();
      const nextDate = DateTime.fromISO('2023-09-01');
      const newTaskSchedule = { title: 'test task', nextDate: nextDate, interval: Duration.fromObject({ days: 7 }) };
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
});
