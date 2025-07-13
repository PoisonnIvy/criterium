import { Navigate } from "react-router-dom";
import CircularProgress from '@mui/joy/CircularProgress';
import {useAuth} from '../hooks/useAuth.jsx';
import {useProject} from '../hooks/useProject.jsx'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const {user, loading}= useAuth();
  const {userRole} = useProject();
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <div>No tienes permisos para esta página</div>;
    }
  if (loading) return <CircularProgress variant='outlined' size='lg'/>;
  if (!user) return <Navigate to="/login" replace/>;

  return children;
};

export default ProtectedRoute;