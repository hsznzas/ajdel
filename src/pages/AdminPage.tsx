import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminPortal from '../components/AdminPortal';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('ajdel_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('ajdel_admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <AdminPortal onLogout={handleLogout} />;
};

export default AdminPage;

