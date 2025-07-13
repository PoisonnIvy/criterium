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
        minHeight: '60vh',
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
          <Typography level="h3" sx={{ mb: 1, color: 'var(--color-terracotta)' }}>
            {user?.name}
          </Typography>
          <Typography level="body-md" color="neutral" sx={{ mb: 1 }}>
            {user?.email}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
            <Typography level="body-md">
              <b>Miembro desde:</b> {formatDate(user?.createdAt)}
            </Typography>
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
          minWidth: 0,
        }}
      >
        <Typography level="h4" sx={{ color: 'var(--color-terracotta)', mb: 2 }}>
          Proyectos en los que colaboras
        </Typography>
        <Typography level="body-md" sx={{ mb: 2 }}>
          <b>Total:</b> {loading ? 'Cargando...' : projects.length}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {projects.length === 0 && !loading && (
          <Typography color="neutral">No participas en ningún proyecto aún.</Typography>
        )}
        <Grid container spacing={2}>
          {projects.map((p) => (
            <Grid xs={12} sm={6} md={4} key={p._id}>
              <Card
                variant="outlined"
                sx={{
                  bgcolor: 'var(--color-sage)',
                  borderColor: 'var(--color-terracotta)',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: 'xs',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip color="primary" variant="soft" size="sm">
                    {getRole(p) || 'Miembro'}
                  </Chip>
                  <Typography level="title-md" sx={{ flex: 1 }}>
                    {p.name}
                  </Typography>
                </Stack>
                <Typography level="body-xs" color="neutral" sx={{ mt: 1 }}>
                  <b>Desde:</b> {getJoinedAt(p)}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Profile;