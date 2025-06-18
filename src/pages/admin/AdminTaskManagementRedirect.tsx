
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTaskManagementRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to property management with a query parameter to show tasks tab
    navigate('/admin/property-management?tab=tasks', { replace: true });
  }, [navigate]);

  return null;
};

export default AdminTaskManagementRedirect;
