/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Stack from '@mui/joy/Stack'
import Grid from '@mui/joy/Grid';
import Button from '@mui/joy/Button';
import Add from '@mui/icons-material/Add';
import Box from '@mui/joy/Box';
import {useAuth} from '../hooks/useAuth';
import BasicFormModal from '../components/FormModal';
import ItemCard from '../components/ItemCard';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import  CircularProgress  from '@mui/joy/CircularProgress';


export default function Project () {
    const {user, setUser}= useAuth()
    const navigate= useNavigate();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: ''});
    const [roleFilter, setRoleFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState('activo');
    const [stat, setStat] = useState(true);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/user`,
          { withCredentials: true }
        );
        setProjects(res.data);
        setLoading(false);
      } catch (error) {
        setUser(null);
        setLoading(false);
        navigate('/login')
        console.error('Error al obtener proyectos:', error);
      }
    };
    fetchProjects();
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const filteredByRole = roleFilter
    ? projects.filter(proj => returnUserRole(proj) === roleFilter)
    : projects;

  const filteredByStatus = statusFilter
    ? projects.filter(proj => proj.status === statusFilter)
    : projects;




  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/new`,
        form,
        { withCredentials: true }
      );
      setShowModal(false);
      navigate(`/project/${res.data.project._id}`);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };


  function returnUserRole(proj){
    for (const member of proj.members){
      if( user.userId===member.userId._id.toString() ){
        return member.role
      }
    }
  }

  if (loading) return <CircularProgress/>

return (
<Box sx={{p:5}} >
<Stack direction='row' spacing={10} alignItems='center' sx={{mb:3}}>
<h1>Mis Proyectos</h1>
<Button size='sm' onClick={() => setShowModal(true)} startDecorator={<Add />} sx={{background: '#4f2621'}}>
Crear nuevo proyecto</Button>
    <Dropdown>
      <MenuButton startDecorator={<ArrowDropDown/>} sx={{background: '#4f2621', color: 'white', '&:hover': { background: '#3e1f1c' }}}>Filtrar por rol</MenuButton>
      <Menu>
        <MenuItem onClick={() => {setRoleFilter("investigador principal"); setStat(false)}}>investigador principal</MenuItem>
        <MenuItem onClick={() => {setRoleFilter("editor"); setStat(false)}}>Editor</MenuItem>
        <MenuItem onClick={() => {setRoleFilter("colaborador"); setStat(false)}}>Colaborador</MenuItem>
        <MenuItem onClick={() => {setRoleFilter(null); setStat(false)}}>Todos</MenuItem>
      </Menu>
    </Dropdown>

    <Dropdown>
      <MenuButton startDecorator={<ArrowDropDown/>} sx={{background: '#4f2621', color: 'white', '&:hover': { background: '#3e1f1c' }}}>Filtrar por estado</MenuButton>
      <Menu>
        <MenuItem onClick={() => {setStatusFilter("activo"); setStat(true)}}>Activo</MenuItem>
        <MenuItem onClick={() => {setStatusFilter("completado"); setStat(true)}}>Completado</MenuItem>
        <MenuItem onClick={() => {setStatusFilter("deshabilitado"); setStat(true)}}>Deshabilitado</MenuItem>
        <MenuItem onClick={() => {setStatusFilter(null); setStat(true)}}>Todos</MenuItem>
      </Menu>
    </Dropdown>
</Stack>
  <Box sx={{ mt:5,maxWidth: '100%', p:2}}>
    {loading && (
      <>
        <CircularProgress />
        <h3>Cargando proyectos...</h3>
      </>
    )}
    {stat? (
      <Grid container sx={{ flexGrow: 1 , alignItems:'initial'}} spacing={{xs:2, md: 3}}columns={{ xs: 4, sm: 8, md: 12 }}>
        {filteredByStatus.map((proj, index)=>(
            <Grid key={index} size={{ xs: 2, sm: 4, md: 4 }}>
              <ItemCard proj={proj} userRole={returnUserRole(proj)}/>
            </Grid>
          ))}
      </Grid>
        )
        :
        (
      <Grid container sx={{ flexGrow: 1 , alignItems:'flex-start'}} spacing={{xs:2, md: 3}}columns={{ xs: 4, sm: 8, md: 12 }}>

          {filteredByRole.map((proj,index) => (
          <Grid key= {index} size={{ xs: 2, sm: 4, md: 4 }}>
            <ItemCard proj={proj} userRole={returnUserRole(proj)}/>
          </Grid>
        ))} 
        
        </Grid>
        )
        }


      <BasicFormModal 
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Proyecto"
        description="Completa la información del proyecto."
        fields={[
          { label: "Nombre", name: "name", type: "text", required: true, min:5 },
          { label: "Descripción", name: "description", type: "textarea", required: true, min:5 }
        ]}
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        />
  </Box>
</Box>  
  );
}
