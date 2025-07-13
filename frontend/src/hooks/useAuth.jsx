import { useContext } from 'react';
import { AuthContext } from '../context';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un elemento AuthProvider');
    }
  return context;
}
