import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { MenuButton } from '##/view/layout/MenuButton';

export const PageLayout: FC = () => {
  return (
    <div id='layout' className='box-border flex h-screen w-screen flex-col overflow-hidden'>
      <main className='grow overflow-hidden'>
        <Outlet />
      </main>
      <div id='menu' className='grid w-full basis-20 grid-cols-3 text-2xl'>
        <div>
          <MenuButton label='ToDo' path='/' />
        </div>
        <div>
          <MenuButton label='予定' path='/schedules' />
        </div>
        <div>
          <MenuButton label='完了済' path='/completedTasks' />
        </div>
      </div>
    </div>
  );
};
