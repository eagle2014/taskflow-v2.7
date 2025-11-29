import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

const TaskDetailDialogTest = lazy(() => import('../../components/TaskDetailDialogTest'));

export const Route = createFileRoute('/test-dialog/')({
  component: TaskDetailDialogTest,
});
