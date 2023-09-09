import { useAtomValue } from 'jotai';
import { type FC } from 'react';

import { selectCompletedTasksAtom } from '##/domain/atom';

export const CompletedTasksPage: FC = () => {
  const completedTasks = useAtomValue(selectCompletedTasksAtom);
  return (
    <div className='flex h-full w-full flex-col'>
      <div className='basis-16 bg-primary-400 py-4 text-center text-2xl text-white'>完了タスク</div>
      <div className='grow overflow-y-auto'>
        {completedTasks.map((completedTask) => (
          <div key={completedTask.id} className='flex h-12 flex-row border-b-2 border-bd-400'>
            <div className='grow p-4'>{completedTask.title}</div>
            <div className='w-32 p-4 text-sm text-bd-700'>
              {completedTask.completedDate.toISODate()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
