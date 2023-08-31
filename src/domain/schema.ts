import { DateTime, Duration } from 'luxon';
import {
  array,
  integer,
  isoDate,
  isoDateTime,
  isoTime,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  record,
  string,
  transform,
  type Input,
  type Output,
} from 'valibot';

import { type JsonMapper } from '#/domain/util/storage';

const TitleSchema = string([minLength(1), maxLength(30)]);
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

function toInputFromTaskSchedule(value: TaskSchedule): Input<typeof TaskScheduleSchema> {
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
    Object.fromEntries(Object.entries(value).map(([key, value]) => [key, toInputFromTaskSchedule(value)])),
};

const CompletedTaskSchema = object({
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

const SettingSchema = object({
  notificationTime: transform(string([isoTime()]), (value) => Duration.fromISOTime(value)),
});

export type Setting = Output<typeof SettingSchema>;

function toInputFromSetting(value: Setting): Input<typeof SettingSchema> {
  return {
    notificationTime: value.notificationTime.toISOTime()!,
  };
}

export const SettingMapper: JsonMapper<typeof SettingSchema> = {
  schema: SettingSchema,
  toInput: toInputFromSetting,
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
