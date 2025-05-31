import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import useAuthRedirect from "../hooks/useAuthRedirect";


const Home = () => {
  const navigate = useNavigate();
  const username = useAuthRedirect({ requireAuth: true });

  useEffect(() => {
    if (username && !sessionStorage.getItem("welcomed")) {
      toast(`Hello ${username}`, { position: "top-right" });
      sessionStorage.setItem("welcomed", "true");
    }
  }, [username]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      sessionStorage.removeItem("welcomed");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);  
    }
  };
  return (
    <>
      <div className="home_page">
        <h4>
          {" "}
          Welcome <span>{username}</span>
        </h4>
        <embed
          src="https://cataas.com/cat"
          width="600"
          height="400"
          type="image/jpg"
          ></embed>
        <button onClick={handleLogout}>LOGOUT</button>
      </div>
      <ToastContainer />
    </>
  );
};

export default Home;