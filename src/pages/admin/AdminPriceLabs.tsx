import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPriceLabs = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the consolidated calendar page with pricing tab
    navigate('/admin/calendar', { replace: true });
  }, [navigate]);

  return null;
};

export default AdminPriceLabs;
