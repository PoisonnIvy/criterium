import React, {useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {useAuth} from "../hooks/useAuth";
import Button from "@mui/joy/Button";
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';
import VerifyCodeModal from '../components/validationModal.jsx'
import IconButton from '@mui/joy/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Signup = () => {
  const {fetchUser} =useAuth()
  const navigate = useNavigate();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    name: "",
  });

  const { email, password, name } = inputValue;
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
    {toast.success(msg, {
      position: "bottom-left",
    });
  }
    

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/auth/signup`,
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      if (data.success) {
        setPendingUser({ email, name, password });
        setShowVerifyModal(true);
        handleSuccess("Código enviado a tu correo");
        handleSuccess(data.message)
        } else {
                handleError(data.message);
        }
    } catch (error) {
      console.log(error);
      handleError("No se pudo enviar el código de verificación");
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
      name: "",
    });
  };

  const handleVerify = async (code) => {
    setVerifyLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/auth/verify`,
        { ...pendingUser, code },
        { withCredentials: true }
      );
      if (data.success) {
        handleSuccess(data.message);
        fetchUser();
        const pendingToken = localStorage.getItem('pendingInviteToken');
        if (pendingToken) {
          const { data } = await axios.post(
            `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/accept/${pendingToken}`,
            {},
            { withCredentials: true }
          );
          localStorage.removeItem('pendingInviteToken');
          setTimeout(() => {
          navigate(`/project/${data.projectId}`);
        }, 800);
          
        } else {
          navigate('/project');
        }
      } else {
        handleError(data.message);
      }
      
    } catch (error) {
      console.log(error)
      handleError("Código incorrecto o expirado");
    }
    setVerifyLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Registrate</h2>
      <form onSubmit={handleSubmit}>
        <div className="inputText">
          <FormLabel sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>Correo electrónico</FormLabel>
          <Input
            sx={{ fontFamily: "'Josefin Sans', sans-serif" }}
            type="email"
            name="email"
            value={email}
            placeholder="Ingresa tu correo electrónico"
            onChange={handleOnChange}
          />
        </div>
        <div className="inputText">
          <FormLabel sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>Nombre</FormLabel>
          <Input
            sx={{ fontFamily: "'Josefin Sans', sans-serif" }}
            type="text"
            name="name"
            value={name}
            placeholder="Ingresa tu nombre"
            onChange={handleOnChange}
          />
        </div>
        <div className="inputText">
          <FormControl >
            <FormLabel sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>Contraseña</FormLabel>
            <Input 
            sx={{ fontFamily: "'Josefin Sans', sans-serif" }}
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
          <FormHelperText 
          sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.</FormHelperText>
          </FormControl>
        </div>
        <Button sx={{ fontFamily: "'Josefin Sans', sans-serif", 
                      backgroundColor:'#538e56ff',
                      color:'#fff',
                      '&:hover':{backgroundColor:"green"}
        }} type="submit">Enviar</Button>
      </form>
      <span className="form-link">
          ¿Ya tienes una cuenta? <Link to={"/login"}>Ingresa</Link>
        </span>

        <VerifyCodeModal
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerify={handleVerify}
        loading={verifyLoading}
      />
      <ToastContainer />
    </div>
  );
};

export default Signup;