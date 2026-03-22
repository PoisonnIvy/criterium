import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import InfoToast from '../components/InfoToast';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import validator from 'validator';


export default function RestorePassword() {
    const navigate = useNavigate();
    const { restore } = useParams();
    const [message, setMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [close, setClose] = useState('Cerrar');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changePassword, setChangePassword] = useState({
      newPassword: '',
      confirmPassword: ''
    });
    const isDisabled =
    !validator.isStrongPassword(changePassword.newPassword, [{ minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }]) ||
    changePassword.confirmPassword !== changePassword.newPassword ||
    !changePassword.newPassword ||
    !changePassword.confirmPassword;

    

    const handleChangePassword = async () => {
      try {
        const res=await axios.post(
                  `${import.meta.env.VITE_APP_SERVER_URL}/auth/validate-password/${restore.toString()}`,
                   changePassword 
                );
        setMessage(res.data.message);
        setOpen(true)
        setClose('Ir a login');
        setChangePassword({ newPassword: '', confirmPassword: '' });
        setTimeout(() => {setOpen(false);navigate('/login')}, 2500);
      } catch (error) {
        setMessage(error.response ? error.response.data.message : 'Error al cambiar la contraseña, intentalo nuevamente');
        setOpen(true);
        setClose('Ir a login');
        setTimeout(() => {setOpen(false);navigate('/login')}, 2500);
        console.error("Error al cambiar la contraseña:", error);
      }
    };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-fondo, #f8f9fa)'
      }}
    >
      <Sheet
        sx={{
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          p: 4,
          minWidth: 340,
          maxWidth: 400,
          width: '100%'
        }}
      >
        <h2 style={{marginBottom: '24px', textAlign: 'center'}}>
          Restablecer contraseña
        </h2>
        <form onSubmit={e => { e.preventDefault(); handleChangePassword() }}>
          <FormControl sx={{ mb: 2 }} required>
            <FormLabel sx={{ fontFamily:"'Josefin sans', sans-serif",color: 'var(--color-terracotta)', fontWeight: 600 }}>Nueva contraseña</FormLabel>
            <Input 
              type={showNewPassword ? "text" : "password"}
              name="newPassword" 
              error={changePassword.newPassword.length > 0 && !validator.isStrongPassword(changePassword.newPassword, [ { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }])}
              required 
              size="lg"
              sx={{fontFamily:"'Josefin sans', sans-serif", mb: 1}} 
              onChange={e => setChangePassword({ ...changePassword, newPassword: e.target.value })} 
              endDecorator={
                <IconButton
                  variant="plain"
                  color="neutral"
                  onClick={() => setShowNewPassword((show) => !show)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              }
              />
              {changePassword.newPassword.length > 0 && !validator.isStrongPassword(changePassword.newPassword, [ { minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }]) && <FormHelperText 
          sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.</FormHelperText>}  
          </FormControl>
          <FormControl sx={{ mb: 3 }} required>
            <FormLabel sx={{ fontFamily:"'Josefin sans', sans-serif", color: 'var(--color-terracotta)', fontWeight: 600 }}>Confirmar contraseña</FormLabel>
            <Input 
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword" 
              error={changePassword.confirmPassword.length > 0 && changePassword.confirmPassword !== changePassword.newPassword}
              required 
              size="lg"
              sx={{fontFamily:"'Josefin sans', sans-serif"}}
              onChange={e => setChangePassword({ ...changePassword, confirmPassword: e.target.value })} 
              endDecorator={
                <IconButton
                  variant="plain"
                  color="neutral"
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              }
              />
          
          </FormControl>
          {changePassword.confirmPassword.length > 0 && changePassword.confirmPassword !== changePassword.newPassword && <FormHelperText 
          sx={{ fontFamily: "'Josefin Sans', sans-serif" }}>Las contraseñas no coinciden.</FormHelperText>}
          <Button
            type="submit"
            color="success"
            variant="solid"
            size='md'
            disabled={isDisabled}
            sx={{fontFamily:"'Josefin sans', sans-serif", width: '100%', fontSize: 16}}
          >
            Cambiar contraseña
          </Button>
        </form>
      </Sheet>
      <InfoToast 
        open={open} 
        message={message}
        close={close}
        onClose={() => {setMessage(''); setOpen(false); navigate('/login')}} 
        />
    </Box>
  )
}
