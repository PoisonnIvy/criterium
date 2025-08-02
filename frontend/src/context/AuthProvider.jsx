/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, createContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext= createContext(null);

export const AuthProvider=({ children })=> {
  const [user, setUser] = useState(null); //user:{name,userId,createdAt,lastlogin, email}
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();

  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER_URL}/auth/me`,
        { withCredentials: true }
      );
      setUser(data.user);
      
    } catch (error) {
      setUser(null);
      navigate('/login')
      console.error({error: error});
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (e) {
      console.error({error:e})
    } finally {
      setUser(null);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    setUser,
    fetchUser,
    logout,
  }), [user,loading, fetchUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

