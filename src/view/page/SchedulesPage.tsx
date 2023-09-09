import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { type FC } from 'react';
import { Link } from 'react-router-dom';

import { selectAllTaskSchedulesAtom } from '##/domain/atom';
import { HeaderButton } from '##/view/common/HeaderButton';

export const SchedulesPage: FC = () => {
  const schedules = useAtomValue(selectAllTaskSchedulesAtom);
  return (
    <div className='flex h-full w-full flex-col'>
      <div className='relative basis-16 bg-primary-400 py-4 text-center text-2xl text-white'>
        予定
        <div className='absolute right-0 top-0 h-full w-24 p-2'>
          <HeaderButton>
            <Link to='/schedules/new'>追加</Link>
          </HeaderButton>
        </div>
      </div>
      <div className='grow overflow-y-auto'>
        {schedules.map((schedule) => (
          <div key={schedule.id} className='flex h-12 flex-row border-b-2 border-bd-400'>
            <div className='grow p-2'>{schedule.title}</div>
            <div className='basis-24 p-2'>
              <Link
                className={clsx(
                  'block text-center',
                  'h-full w-full rounded-lg border text-xl font-bold',
                  'border-bd-600 bg-white text-bd-600',
                  'transition-colors duration-200 hover:bg-primary-100',
                )}
                to={`/schedules/${schedule.id}`}
              >
                編集
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
