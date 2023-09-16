import { createBrowserRouter } from 'react-router-dom';

import { PageLayout } from '##/view/layout/PageLayout';
import { CompletedTasksPage } from '##/view/page/CompletedTasksPage';
import { CreateSchedulePage } from '##/view/page/CreateSchedulePage';
import { SchedulesPage } from '##/view/page/SchedulesPage';
import { ToDoPage } from '##/view/page/ToDoPage';
import { UpdateSchedulePage } from '##/view/page/UpdateSchedulePage';

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      {
        path: '/',
        element: <ToDoPage />,
      },
      {
        path: '/schedules',
        element: <SchedulesPage />,
      },
      {
        path: '/completedTasks',
        element: <CompletedTasksPage />,
      },
      {
        path: '/schedules/new',
        element: <CreateSchedulePage />,
      },
      {
        path: '/schedules/:id',
        element: <UpdateSchedulePage />,
      },
    ],
  },
]);
