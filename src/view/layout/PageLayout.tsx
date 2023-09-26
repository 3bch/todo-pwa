import { type FC } from 'react';
import { Outlet } from 'react-router-dom';

import { MenuButton } from '##/view/layout/MenuButton';
import styles from '##/view/layout/PageLayout.module.css';

export const PageLayout: FC = () => {
  return (
    <div className={styles.pageLayout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <div className={styles.menuTodo}>
        <MenuButton label='ToDo' path='/' />
      </div>
      <div className={styles.menuSchedules}>
        <MenuButton label='予定' path='/schedules' />
      </div>
      <div className={styles.menuCompleted}>
        <MenuButton label='完了済' path='/completedTasks' />
      </div>
    </div>
  );
};
