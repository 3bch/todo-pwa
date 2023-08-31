import { DateTime, Duration } from 'luxon';
import { parse } from 'valibot';

import { TaskScheduleSchema, TaskSchedulesMapper } from '#/domain/schema';

describe('domain/schema', () => {
  describe('TaskScheduleSchema', () => {
    test('正常な入力を正しく変換できる', () => {
      const input = {
        id: 'test-id',
        title: 'test task',
        nextDate: '2023-09-01',
        interval: { days: 7 },
      };

      const actual = parse(TaskScheduleSchema, input);

      expect(actual).toStrictEqual({
        id: 'test-id',
        title: 'test task',
        nextDate: DateTime.fromISO('2023-09-01'),
        interval: Duration.fromObject({ days: 7 }),
        weekday: undefined,
      });
    });
  });

  describe('TaskSchedulesMapper', () => {
    test('正常な入力を正しく変換できる', () => {
      const input = {
        'test-id': {
          id: 'test-id',
          title: 'test task',
          nextDate: '2023-09-01',
          interval: { days: 7 },
        },
      };

      const actual = parse(TaskSchedulesMapper.schema, input);

      expect(actual).toStrictEqual({
        'test-id': {
          id: 'test-id',
          title: 'test task',
          nextDate: DateTime.fromISO('2023-09-01'),
          interval: Duration.fromObject({ days: 7 }),
          weekday: undefined,
        },
      });
    });
  });
});
