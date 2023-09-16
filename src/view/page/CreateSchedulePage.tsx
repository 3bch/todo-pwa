import { valibotResolver } from '@hookform/resolvers/valibot';
import { useSetAtom } from 'jotai';
import { DateTime } from 'luxon';
import { useCallback, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { parse } from 'valibot';

import { createTaskScheduleAtom } from '##/domain/atom';
import { TaskScheduleFormSchema, type TaskScheduleForm } from '##/domain/schema';
import { subscribe } from '##/domain/subscribe';
import { HeaderButton } from '##/view/common/HeaderButton';

export const CreateSchedulePage: FC = () => {
  const createTaskSchedule = useSetAtom(createTaskScheduleAtom);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskScheduleForm>({
    defaultValues: {
      title: '',
      nextDate: DateTime.now().toISODate() ?? undefined,
      interval: {
        value: 1,
        unit: 'weeks',
      },
      weekday: null,
    },
    resolver: valibotResolver(TaskScheduleFormSchema, undefined, {
      raw: true,
    }),
  });
  const navigate = useNavigate();

  const onSuccess = useCallback(
    async (data: TaskScheduleForm) => {
      const result = parse(TaskScheduleFormSchema, data);
      createTaskSchedule(result);
      await subscribe();
      navigate('/schedules');
    },
    [createTaskSchedule, navigate],
  );

  return (
    <div className='flex h-full w-full flex-col'>
      <form onSubmit={handleSubmit(onSuccess)}>
        <div className='relative basis-16 bg-primary-400 py-4 text-center text-2xl text-white'>
          予定を追加
          <div className='absolute left-0 top-0 h-full w-24 p-2'>
            <HeaderButton>
              <Link to='/schedules'>戻る</Link>
            </HeaderButton>
          </div>
          <div className='absolute right-0 top-0 h-full w-24 p-2'>
            <HeaderButton submit={true}>保存</HeaderButton>
          </div>
        </div>
        <div className='grid grow grid-cols-3'>
          <div className='pt-4 text-right text-2xl'>
            <label htmlFor='title'>タイトル:</label>
          </div>
          <div className='col-span-2 px-4 pt-4'>
            <input
              {...register('title')}
              id='title'
              className='w-full border-b-2 border-bd-400 text-2xl transition-colors duration-200 focus:border-primary-500 focus:outline-none'
              maxLength={20}
              placeholder='タイトル'
              aria-invalid={errors.title ? 'true' : 'false'}
            />
          </div>
          <div className='col-span-2 col-start-2 h-4 px-4 py-0 text-xs text-error-500'>
            {errors.title?.message}
          </div>
          <div className='py-4 text-right text-2xl'>
            <label htmlFor='next-date'>次予定日:</label>
          </div>
          <div className='col-span-2 p-4'>
            <input
              {...register('nextDate')}
              id='next-date'
              className='w-full border-b-2 border-bd-400 text-2xl transition-colors duration-200 focus:border-primary-500 focus:outline-none'
              type='date'
            />
          </div>
          <div className='pt-4 text-right text-2xl'>
            <label htmlFor='interval'>間隔:</label>
          </div>
          <div className='px-4 pt-4'>
            <input
              {...register('interval.value', { valueAsNumber: true })}
              id='interval'
              className='w-full border-b-2 border-bd-400 text-center text-2xl transition-colors duration-200 focus:border-primary-500 focus:outline-none'
              type='number'
            />
          </div>
          <div className='px-4 pt-4'>
            <select
              {...register('interval.unit')}
              className='w-full border-b-2 border-bd-400 text-2xl transition-colors duration-200 focus:border-primary-500 focus:outline-none'
            >
              <option value='days'>日</option>
              <option value='weeks'>週</option>
              <option value='months'>月</option>
              <option value='years'>年</option>
            </select>
          </div>
          <div className='col-span-2 col-start-2 h-4 px-4 py-0 text-xs text-error-500'>
            {errors.interval?.value?.message}
          </div>
          <div className='py-4 text-right text-2xl'>
            <label htmlFor='weekday'>曜日:</label>
          </div>
          <div className='col-span-2 p-4'>
            <select
              id='weekday'
              {...register('weekday', { valueAsNumber: true })}
              className='w-full border-b-2 border-bd-400 text-2xl transition-colors duration-200 focus:border-primary-500 focus:outline-none'
            >
              <option value={undefined} />
              <option value={1}>月曜日</option>
              <option value={2}>火曜日</option>
              <option value={3}>水曜日</option>
              <option value={4}>木曜日</option>
              <option value={5}>金曜日</option>
              <option value={6}>土曜日</option>
              <option value={0}>日曜日</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};
