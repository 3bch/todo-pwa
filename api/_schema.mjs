import { array, integer, maxValue, minValue, number, object, optional, string } from 'valibot';

export const PushSubscriptionSchema = object({
  endpoint: string(),
  keys: object({
    auth: string(),
    p256dh: string(),
  }),
});

const DurationSchema = object({
  years: optional(number([integer(), minValue(1)])),
  months: optional(number([integer(), minValue(1)])),
  weeks: optional(number([integer(), minValue(1)])),
  days: optional(number([integer(), minValue(1)])),
});

const TaskScheduleSchema = object({
  id: string(),
  title: string(),
  nextDate: string(),
  interval: DurationSchema,
  weekday: optional(number([integer(), minValue(1), maxValue(7)])),
});

export const TaskSchedulesSchema = array(TaskScheduleSchema);

export const BackupSchema = object({
  endpoint: string(),
  schedules: TaskSchedulesSchema,
});
