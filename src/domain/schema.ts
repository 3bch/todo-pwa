import { DateTime, Duration } from 'luxon';
import {
  array,
  integer,
  isoDate,
  isoDateTime,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nan,
  nullish,
  number,
  object,
  optional,
  record,
  string,
  transform,
  union,
  type Input,
  type Output,
} from 'valibot';

import { type JsonMapper } from '##/domain/util/storage';

const TitleSchema = string([minLength(1, '必須項目です'), maxLength(20)]);
const DateSchema = transform(string([isoDate()]), (value) => DateTime.fromISO(value));

const DurationSchema = transform(
  object({
    years: optional(number([integer(), minValue(1)])),
    months: optional(number([integer(), minValue(1)])),
    weeks: optional(number([integer(), minValue(1)])),
    days: optional(number([integer(), minValue(1)])),
  }),
  (value) => Duration.fromObject(value),
);

export const TaskScheduleSchema = object({
  id: string(),
  title: TitleSchema,
  nextDate: DateSchema,
  interval: DurationSchema,
  weekday: optional(number([integer(), minValue(1), maxValue(7)])),
});

export type TaskSchedule = Output<typeof TaskScheduleSchema>;

export function toInputFromTaskSchedule(value: TaskSchedule): Input<typeof TaskScheduleSchema> {
  return {
    ...value,
    nextDate: value.nextDate.toISODate()!,
    interval: value.interval.toObject(),
  };
}

const TaskSchedulesSchema = record(string(), TaskScheduleSchema);

export const TaskSchedulesMapper: JsonMapper<typeof TaskSchedulesSchema> = {
  schema: TaskSchedulesSchema,
  toInput: (value) =>
    Object.fromEntries(
      Object.entries(value).map(([key, value]) => [key, toInputFromTaskSchedule(value)]),
    ),
};

const CompletedTaskSchema = object({
  id: string(),
  title: TitleSchema,
  scheduledDate: DateSchema,
  completedDate: DateSchema,
});

export type CompletedTask = Output<typeof CompletedTaskSchema>;

function toInputFromCompletedTask(value: CompletedTask): Input<typeof CompletedTaskSchema> {
  return {
    ...value,
    scheduledDate: value.scheduledDate.toISODate()!,
    completedDate: value.completedDate.toISODate()!,
  };
}

const CompletedTasksSchema = array(CompletedTaskSchema);

export const CompletedTasksMapper: JsonMapper<typeof CompletedTasksSchema> = {
  schema: CompletedTasksSchema,
  toInput: (value) => value.map(toInputFromCompletedTask),
};

const NotificationScheduleSchema = record(
  string([isoDateTime()]),
  array(
    object({
      id: string(),
      title: TitleSchema,
    }),
  ),
);

export type NotificationSchedule = Output<typeof NotificationScheduleSchema>;

export const NotificationSchedulesMapper: JsonMapper<typeof NotificationScheduleSchema> = {
  schema: NotificationScheduleSchema,
  toInput: (value) => value,
};

export const TaskScheduleFormSchema = object({
  title: TitleSchema,
  nextDate: DateSchema,
  interval: transform(
    object({
      value: number([
        integer('整数値である必要があります'),
        minValue(1, '1 以上である必要があります'),
      ]),
      unit: union([literal('years'), literal('months'), literal('weeks'), literal('days')]),
    }),
    ({ value, unit }) => Duration.fromObject({ [unit]: value }),
  ),
  weekday: transform(
    nullish(union([nan(), number([integer(), minValue(1), maxValue(7)])])),
    (value) => {
      if (value == null) {
        return undefined;
      }
      return Number.isNaN(value) ? undefined : value;
    },
  ),
});

export type TaskScheduleForm = Input<typeof TaskScheduleFormSchema>;
