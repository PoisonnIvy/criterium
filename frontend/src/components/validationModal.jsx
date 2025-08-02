import React, { useState } from "react";
import Modal from "@mui/joy/Modal";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";

export default function VerifyCodeModal({ open, onClose, onVerify, loading }) {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    onVerify(code);
  };

  return (
    <Modal open={open} onClose={(reason) => {
    if (reason !== 'backdropClick') {
      onClose
    }
  }} >
      <Box sx={{ bgcolor: 'background.body', p: 4, borderRadius: 2, maxWidth: 500, mx: 'auto', mt: 10 }}>
        <Typography level="h4" mb={2}>Verifica tu correo</Typography>
        <Typography mb={2}>Ingresa el código de 6 dígitos que enviamos a tu correo.</Typography>
        <Input
          placeholder="Código de verificación"
          value={code}
          onKeyDown={(e) => {
          if (e.key === 'Enter' && code.length === 6 && !loading) handleVerify();
          }}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
        />
        <Stack direction="row" spacing={2} mt={2}>
          <Button  onClick={onClose} color="danger">Cancelar</Button>
          <Button onClick={handleVerify} disabled={code.length !== 6 || loading} color="success">
            Verificar
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
