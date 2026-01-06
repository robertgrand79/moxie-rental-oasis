import React from 'react';
import UserFeedbackManagement from '@/components/admin/superadmin/UserFeedbackManagement';

const PlatformFeedbackPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Feedback</h1>
        <p className="text-muted-foreground">Review user feedback and suggestions</p>
      </div>
      <UserFeedbackManagement />
    </div>
  );
};

export default PlatformFeedbackPage;
