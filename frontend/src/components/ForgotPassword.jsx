/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Modal, Box, Typography, Input, Button } from '@mui/joy';
import axios from 'axios';

export default function ForgotPassword({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_APP_SERVER_URL}/auth/reset-password`, { email });
      setMessage(data.message);
      if (data.success) setCodeSent(true);
    } catch (error) {
      setMessage('Error al enviar el código');
    }
    setLoading(false);
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ bgcolor: 'background.body', p: 4, borderRadius: 2, maxWidth: 400, mx: 'auto', mt: 10 }}>
        <Typography level="h4" mb={2}>Recuperar contraseña</Typography>
        {!codeSent &&
          <>
            <Input
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button onClick={handleSendCode} loading={loading}>Enviar código</Button>
          </>
          }
        {message && <Typography sx={{backgroundColor: '#f3f4f6'}} mt={2}>{message}</Typography>}
      </Box>
    </Modal>
  );
}