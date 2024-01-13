import { useAtomValue, useSetAtom } from 'jotai';
import { type Duration, type DurationObjectUnits } from 'luxon';
import { useCallback, type FC } from 'react';
import { Link } from 'react-router-dom';

import { restoreTaskSchedulesAtom, selectAllTaskSchedulesAtom } from '##/domain/atom';
import { restoreSchedules } from '##/domain/store';
import { HeaderButton } from '##/view/common/HeaderButton';
import styles from '##/view/page/SchedulesPage.module.css';

function formatInterval(interval: Duration): string {
  const unit = interval.toObject();
  const keys = Object.keys(unit);
  if (keys.length !== 1) {
    return '不正な値';
  }
  const key = keys[0]! as keyof DurationObjectUnits;
  const value = unit[key];
  switch (key) {
    case 'years':
      return `${value}年`;
    case 'months':
      return `${value}ヶ月`;
    case 'weeks':
      return `${value}週間`;
    case 'days':
      return `${value}日`;
    default:
      return '不正な値';
  }
}

function formatWeekday(weekday: number): string {
  switch (weekday) {
    case 1:
      return '月';
    case 2:
      return '火';
    case 3:
      return '水';
    case 4:
      return '木';
    case 5:
      return '金';
    case 6:
      return '土';
    case 7:
      return '日';
    default:
      return '不正な値';
  }
}

export const SchedulesPage: FC = () => {
  const schedules = useAtomValue(selectAllTaskSchedulesAtom);
  schedules.sort((a, b) => a.nextDate.toMillis() - b.nextDate.toMillis());

  const restoreSetter = useSetAtom(restoreTaskSchedulesAtom);
  const restore = useCallback(async () => {
    await restoreSchedules(restoreSetter);
  }, [restoreSetter]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className='absolute left-0 top-0 h-full w-24 p-2 text-xs'>
          <HeaderButton onClick={restore}>リストア</HeaderButton>
        </div>
        予定
        <div className='absolute right-0 top-0 h-full w-24 p-2 text-xs'>
          <HeaderButton>
            <Link to='/schedules/new'>追加</Link>
          </HeaderButton>
        </div>
      </div>
      <div className={styles.list}>
        {schedules.map((schedule) => (
          <div key={schedule.id} className={styles.row}>
            <div className={styles.title}>{schedule.title}</div>
            <div className={styles.detail}>
              {schedule.nextDate?.setLocale('ja').toFormat('yyyy/MM/dd(EEEEE)')}
              {', '}
              {formatInterval(schedule.interval)}
              {schedule.weekday !== undefined ? `, ${formatWeekday(schedule.weekday)}` : null}
            </div>
            <div className={styles.edit}>
              <Link className={styles.editButton} to={`/schedules/${schedule.id}`}>
                編集
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
