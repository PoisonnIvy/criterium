import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Sheet from '@mui/joy/Sheet';
import Alert from '@mui/joy/Alert';

const typeColor = {
    info: 'primary',
    success: 'success',
    error: 'danger',
    warning: 'warning',
};

const InfoToast = ({
    open,
    message,
    close,
    type = 'info',
    showConfirm = false,
    showCancel = false,
    onConfirm,
    onCancel,
    onClose,
}) => (
    <Modal open={open} onClose={onClose}>
        <ModalDialog>
            <Sheet
                variant="outlined"
                sx={{
                    minWidth: 320,
                    borderRadius: 'md',
                    boxShadow: 'lg',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Alert
                    color={typeColor[type] || 'primary'}
                    variant="soft"
                    sx={{ width: '100%', mb: 2 }}
                >
                    <Typography level="body-md" >
                    {message}
                </Typography>
                </Alert>
                
                <div style={{ display: 'flex', gap: 12 }}>
                    {showCancel && (
                        <Button variant="outlined" color="neutral" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    {showConfirm && (
                        <Button
                            variant="solid"
                            color={ type==='success' ? 'success' : 'danger'}
                            onClick={onConfirm}
                        >
                            Confirmar
                        </Button>
                    )}
                    {!showConfirm && !showCancel && (
                        <Button
                            variant="solid"
                            color={typeColor[type] || 'primary'}
                            onClick={onClose}
                        >
                            {close? close : 'Cerrar'}
                        </Button>
                    )}
                </div>
            </Sheet>
        </ModalDialog>
    </Modal>
);

export default InfoToast;
