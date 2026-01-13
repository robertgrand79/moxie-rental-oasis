import React from 'react';
import { Helmet } from 'react-helmet-async';
import TaskWorkflowManager from '@/components/admin/platform/TaskWorkflowManager';

const TaskWorkflowsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Task Workflows | Platform Admin</title>
      </Helmet>
      <TaskWorkflowManager />
    </>
  );
};

export default TaskWorkflowsPage;
