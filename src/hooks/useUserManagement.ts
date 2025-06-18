
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserFetch } from './user-management/useUserFetch';
import { useUserOperations } from './user-management/useUserOperations';

export const useUserManagement = () => {
  const { user } = useAuth();
  const {
    users,
    loading,
    error,
    fetchUsers,
    searchUsers
  } = useUserFetch();

  const {
    updateUserProfile,
    updateUserRole,
    deleteUser,
    inviteUser,
    bulkUpdateUserRoles
  } = useUserOperations();

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserProfile,
    updateUserRole,
    deleteUser,
    inviteUser,
    searchUsers,
    bulkUpdateUserRoles,
  };
};
