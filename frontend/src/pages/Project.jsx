import {React, useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import { styled } from '@mui/joy/styles';

const Project = () => {
    const navigate= useNavigate();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', members: [] });

    const Item = styled(Sheet)(({ theme }) => ({
  ...theme.typography['body-sm'],
  textAlign: 'center',
  fontWeight: theme.fontWeight.md,
  color: theme.vars.palette.text.secondary,
  border: '1px solid',
  borderColor: theme.palette.divider,
  padding: theme.spacing(1),
  borderRadius: theme.radius.md,
}));

  // Obtener proyectos del usuario
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/user`,
          { withCredentials: true }
        );
        setProjects(res.data);
      } catch (error) {
        console.error('Error al obtener proyectos:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Enviar formulario para crear proyecto
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/new`,
        form,
        { withCredentials: true }
      );
      setShowModal(false);
      // Redirigir a la subpágina del proyecto recién creado
      navigate(`/project/${res.data.project._id}`);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

return (
    <>
      <div>
        <h2>Mis Proyectos</h2>
          {projects.map(proj => (
            <Stack spacing={2} >
              <Item>
              <div>{proj.name}</div>
              <Button key={proj._id} onClick={() => navigate(`/project/${proj._id}`)}>Ver</Button>
              </Item>
            </Stack>
          ))}
        <button onClick={() => setShowModal(true)}>Crear nuevo proyecto</button>
      </div>

      {/* Modal para crear proyecto */}
      {showModal && (
        <div className="modal">
          <form onSubmit={handleSubmit}>
            <h3>Nuevo Proyecto</h3>
            <input
              name="name"
              placeholder="Nombre"
              value={form.name}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Descripción"
              value={form.description}
              onChange={handleChange}
              required
            />
            {/* Aquí puedes agregar campos para miembros si lo necesitas */}
            <button type="submit">Crear</button>
            <button type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
      <Button variant='outlined' onClick={()=> navigate('/home')}>Volver</Button>
    </>
  );
}

export default Project