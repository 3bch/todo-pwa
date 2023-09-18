import { clsx } from 'clsx';
import { useAtomValue, useSetAtom } from 'jotai';
import { DateTime } from 'luxon';
import { useCallback, useState, type FC } from 'react';
import { Link } from 'react-router-dom';

import { completeTaskAtom, selectTodoTasksAtom, updateTodayAtom } from '##/domain/atom';
import { HeaderButton } from '##/view/common/HeaderButton';

export const ToDoPage: FC = () => {
  const todoTasks = useAtomValue(selectTodoTasksAtom);
  const completeTask = useSetAtom(completeTaskAtom);
  const updateToday = useSetAtom(updateTodayAtom);

  // 今日の日付を更新する
  updateToday();

  // TODO: nextDate と経過日数を表示する
  // TODO: 完了ボタンを実装する
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const handleComplete = useCallback(() => {
    console.log(checkedTasks);
    const today = DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    for (const taskId of checkedTasks) {
      completeTask(taskId, today);
    }
    setCheckedTasks(new Set());
  }, [checkedTasks, completeTask]);

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        className={clsx(
          'basis-16',
          'bg-primary-400',
          'text-center',
          'text-2xl',
          'text-white',
          'py-4',
          'relative',
        )}
      >
        ToDo
        <div className='absolute left-0 top-0 h-full w-24 p-2'>
          <HeaderButton onClick={handleComplete}>完了</HeaderButton>
        </div>
      </div>
      <div className='grow overflow-y-auto'>
        {todoTasks.map((todoTask) => (
          <div key={todoTask.id} className='flex h-12 flex-row border-b-2 border-bd-400'>
            <div className='relative basis-12'>
              <input
                type='checkbox'
                className='absolute inset-0 m-auto block h-8 w-8 rounded-full align-middle accent-primary-500'
                checked={checkedTasks.has(todoTask.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedTasks((prev) => new Set([...prev, todoTask.id]));
                  } else {
                    setCheckedTasks((prev) => {
                      const next = new Set(prev);
                      next.delete(todoTask.id);
                      return next;
                    });
                  }
                }}
              />
            </div>
            <div className='grow p-2'>{todoTask.title}</div>
            <div className='basis-24 p-2'>
              <Link
                className={clsx(
                  'block text-center',
                  'h-full w-full rounded-lg border text-xl font-bold',
                  'border-bd-600 bg-white text-bd-600',
                  'transition-colors duration-200 hover:bg-primary-100',
                )}
                to={`/schedules/${todoTask.id}`}
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
