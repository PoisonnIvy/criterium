import * as React from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';
import DialogContent from '@mui/joy/DialogContent';
import Button from '@mui/joy/Button';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import MenuBookIcon from '@mui/icons-material/MenuBook'
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function DrawerNav({ open, onClose }) {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  if (loading || !user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      sessionStorage.removeItem("welcomed");
      return navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Desconocido';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Drawer open={open} onClose={onClose} size="sm" sx={{ bgcolor: 'background.body' }}>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 0, minWidth: 220 }}>
        <Box
          sx={{
            width: '100%',
            bgcolor: 'white',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2,
            px: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar
            size="lg"
            sx={{
              bgcolor: 'var(--color-terracotta)',
              color: 'white',
              fontWeight: 700,
              fontSize: 32,
              width: 56,
              height: 56,
              mb: 1
            }}
            onClick={() => { navigate("/perfil"); onClose(); }}
          >
            {user?.name?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Typography
            level="title-md"
            sx={{ fontWeight: 600, color: 'var(--color-terracotta)', mb: 0.5 }}
            noWrap
          >
            {user.name}
          </Typography>
          <Typography
            level="body-xs"
            sx={{ color: 'text.secondary', mb: 1 }}
            noWrap
          >
            Última conexión: {formatDate(user.lastLogin)}
          </Typography>
        </Box>
        <List sx={{ gap: 3, py: 5, px: 1 }}>
          <ListItem>
            <ListItemButton
              onClick={() => { navigate('/perfil'); onClose(); }}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                gap: 1.5,
                fontSize: 16,
                '&:hover': { bgcolor: 'var(--color-terracotta)', color: 'white' }
              }}
            >
              <PersonIcon fontSize="small" />
              Perfil
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => { navigate('/project'); onClose(); }}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                gap: 1.5,
                fontSize: 16,
                '&:hover': { bgcolor: 'var(--color-terracotta)', color: 'white' }
              }}
            >
              <FolderIcon fontSize="small" />
              Proyectos
            </ListItemButton>
          </ListItem>
         
        </List>
        <Box
          sx={{
            mt: 'auto',
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Button
            variant="solid"
            color="danger"
            startDecorator={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 2,
              bgcolor: 'var(--color-terracotta)',
              '&:hover': { bgcolor: 'var(--color-terracotta)' }
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </DialogContent>
    </Drawer>
  );
}
