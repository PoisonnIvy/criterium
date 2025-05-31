import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// options: { requireAuth: true } => redirige a login si no hay sesión
// options: { requireAuth: false } => redirige a /home si hay sesión
const useAuthRedirect = ({ requireAuth }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}/auth/me`,
          { withCredentials: true }
        );
        if (requireAuth && !data.status) {
          navigate("/login");
        }
        if (!requireAuth && data.status) {
          navigate("/home");
        }
         if (data.status) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Session verification error:", error);
        if (requireAuth) navigate("/login");
      }
    };
    checkSession();
  }, [navigate, requireAuth]);

  return user;
};

export default useAuthRedirect;