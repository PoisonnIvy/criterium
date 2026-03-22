/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Avatar, Stack, Divider, Chip, Grid } from '@mui/joy';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/user`,
          { withCredentials: true }
        );
        setProjects(res.data || []);
      } catch (error) {
        setProjects([]);
      }
      setLoading(false);
    };
    if (user?.userId) fetchProjects();
  }, [user]);


  const formatDate = (date) => {
    if (!date) return 'Desconocido';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getJoinedAt = (project) => {
    const member = project.members?.find(m => m.userId === user.userId || m.userId?._id === user.userId);
    return member?.joinedAt ? formatDate(member.joinedAt) : 'Desconocido';
  };

  
  const getRole = (project) => {
  const member = project.members?.find(m => m.userId === user.userId || m.userId?._id === user.userId);
  return member?.role || 'Miembro';
};

  return (
    <Box
      sx={{
        mx: 'auto',
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        p: { xs: 2, md: 4 },
        mt: 2,
        height:'auto',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
          bgcolor: 'white',
          borderRadius: 3,
          p: 3,
          boxShadow: 'sm',
        }}
      >
        <Avatar
          size="xl"
          sx={{
            bgcolor: 'var(--color-terracotta)',
            color: 'white',
            fontSize: 48,
            width: 90,
            height: 90,
            mr: { sm: 3 }
          }}
        >
          {user?.name?.[0]?.toUpperCase() || '?'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <h2 sx={{ mb: 1, color: 'var(--color-terracotta)' }}>
            {user?.name}
          </h2>
          <h4 sx={{ mb: 1 }}>
            {user?.email}
          </h4>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
            <span>
              <b>Miembro desde:</b> {formatDate(user?.createdAt)}
            </span>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          width: '100%',
          bgcolor: 'white',
          borderRadius: 3,
          p: 3,
          boxShadow: 'sm',
        }}
      >
        <Typography level="h4" sx={{ color: 'var(--color-terracotta)', mb: 2 }}>
          Proyectos en los que colaboras
        </Typography>
        <Chip variant='outlined' color='primary' sx={{ mb: 2 }}>
          <b>Total:</b> {loading ? 'Cargando...' : projects.length}
        </Chip>
        <Divider sx={{ mb: 2 }} />
        {projects.length === 0 && !loading && (
          <Typography color="neutral">No participas en ningún proyecto aún.</Typography>
        )}
        <Grid container spacing={2} sx={{ mx: 'auto', alignItems:'center' }} >
          {projects.map((p) => (
            <Grid xs={12} sm={6} md={4} key={p._id} >
              <Card
                variant="outlined"
                sx={{
                  bgcolor: 'var(--color-sage)',
                  borderColor: 'var(--color-terracotta)',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: 'xs',
                  minWidth: '200px',
                  maxWidth: '300px',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                  <h4>
                    {p.name.length > 30 ? `${p.name.slice(0, 40)}...` : p.name}
                  </h4>
                <Stack direction="column" spacing={1} sx={{ mt: 2, justifyContent: 'center' }}>
                  <Chip color="primary" variant="soft" size="sm">
                    {getRole(p) || 'Miembro'}
                  </Chip>
                <Typography level="body-xs" color="neutral" sx={{ mt: 1 }}>
                  <b>Desde:</b> {getJoinedAt(p)}
                </Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Profile;