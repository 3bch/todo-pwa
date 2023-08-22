import { array, object, string, isoDateTime } from 'valibot';

export const TimerStateSchema = array(
  object({
    id: string(),
    title: string(),
    dateTime: string([isoDateTime()]),
  }),
);
