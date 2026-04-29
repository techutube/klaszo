import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
