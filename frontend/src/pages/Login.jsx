import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Button from "@mui/joy/Button";
import FormLabel  from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {useAuth} from "../hooks/useAuth";
import Stack from "@mui/material/Stack";
import ForgotPassword from "../components/ForgotPassword";

const Login = () => {
  const {fetchUser, user} = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const { email, password } = inputValue;


  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-left",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/auth/login`,
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        fetchUser();
        const pendingToken = localStorage.getItem('pendingInviteToken');
        if (pendingToken) {
          const { data } = await axios.post(
            `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/accept/${pendingToken}`,
            {},
            { withCredentials: true }
          );
          localStorage.removeItem('pendingInviteToken');
          navigate(`/project/${data.projectId}`);
        } else {
          navigate('/project');
        }
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
    });
  };

  if(user) navigate('/project');

  return (
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <FormLabel sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>Correo electrónico</FormLabel>
        <Input
        sx={{ fontFamily: "'Josefin Sans', sans-serif" }}
            fullWidth 
            type="email"
            name="email"
            value={email}
            placeholder="Ingresa tu correo electronico"
            onChange={handleOnChange}
        />
        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px'}}>
        <FormLabel sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>Contraseña</FormLabel>
        <FormLabel  onClick={() => setShowForgotModal(true)}
                    sx={{ fontFamily: "'Josefin Sans', sans-serif", color:"#b56a65" }} 
                    to={"/restore-password"}>Olvidé mi contraseña</FormLabel>
        </Stack>
          <Input
          sx={{ fontFamily: "'Josefin Sans', sans-serif" }}
          fullWidth
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            placeholder="Ingresa tu contraseña"
            onChange={handleOnChange}
            endDecorator={
              <IconButton
                variant="plain"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
          />
          
        <Button sx={{ fontFamily: "'Josefin Sans', sans-serif", 
                      backgroundColor:'#538e56ff',
                      color:'#fff',
                      '&:hover':{backgroundColor:"green"}}} type="submit">Enviar</Button>
      </form>
      <span>
          ¿No tienes una cuenta? <Link className='a' to={"/signup"}>Regístrate</Link>
        </span>
      <ToastContainer />
      <ForgotPassword open={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
};

export default Login;