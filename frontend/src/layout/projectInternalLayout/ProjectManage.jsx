import { useProject } from '../../hooks/useProject'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Stack from '@mui/joy/Stack'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import InfoToast from '../../components/InfoToast'
import BasicFormModal from '../../components/FormModal'
import { useEffect } from 'react'
import ProjectMembersManager from '../../components/ProjectMembersManager'


const ProjectManage = () => {
  const{ role, project}=useProject();
  const {projectId} = useParams();
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [pendingAction, setPendingAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [members, setMembers] = useState(project?.members || []);
  const isBlocked = project && ['completado', 'deshabilitado'].includes(project.status);


  const [editValues, setEditValues] = useState({
    name: project?.name || '',
    description: project?.description || ''
  });

  const editFields = [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'text', required: true }
  ];
  useEffect(()=>{
    if (!modalOpen) { 
    setEditValues({
      name: project?.name || '',
      description: project?.description || ''
    })
  }
    setMembers(project?.members || []);
  }, [project, modalOpen])

  const refreshMembers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/${projectId}`,
        { withCredentials: true }
      );
      setMembers(res.data.members || []);
    } catch (error) {
      console.log('Error recargando miembros', error);
    }
  };

  const handleEditChange = (e) => {
    setEditValues(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProjectStatus= async (status)=>{
    try {
      await axios.patch(
        `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/change/${projectId}?status=${status}`,
        {},
        { withCredentials: true }
      );
      setToastMessage(`Proyecto marcado como '${status}' correctamente`);
      setToastType('success');
      setToastOpen(true);
    } catch (error) {
      console.log(error)
      setToastMessage('Error al cambiar el estado del proyecto');
      setToastType('error');
      setToastOpen(true);
      console.log(error.response.data.message)
    }
  }

  const handleLeaveProject = async () =>{
    try {
      await axios.delete(`${import.meta.env.VITE_APP_SERVER_URL}/proyecto/leave/${projectId}`, 
        {withCredentials:true})
        setToastMessage('Has abandonado el proyecto correctamente');
        setToastType('success');
        setToastOpen(true);
      setTimeout(() => {
        navigate('/project')
      }, 2500);
    } catch (error) {
      setToastMessage('Error al abandonar el proyecto');
      setToastType('error');
      setToastOpen(true);
      console.log(error)
      console.log(error.response.data.message)
    }
  }
  const handleEdit = async()=>{
    try {
      await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/proyecto/edit/${projectId}`,
        editValues,
        {withCredentials:true})
      setToastMessage('Proyecto actualizado correctamente')
      setToastType('success')
      setToastOpen(true);
    } catch (error) {
      console.log(error)
      setToastMessage(error.response.data.message || 'Error al actualizar el proyecto')
      setToastType('success')
      setToastOpen(true);
    }
  }

  return (
  <Box component="main" sx={{ p: 5, maxWidth: 1200, mx: 'auto'}}>
    <h2>Configuración</h2>
    <Stack direction='row' alignItems='center' sx={{mb:3, mt:5}} spacing={2}>
      {['investigador principal','editor'].includes(role) && <Button disabled={isBlocked} sx={{background: '#4f2621', color: 'white', '&:hover': { background: '#3e1f1c' }}} onClick={() => setModalOpen(true)}>Editar detalles del proyecto</Button>}
      {['investigador principal'].includes(role) && (project.status === 'deshabilitado' || project.status === 'completado')?
      (
        <Button 
        color='success' 
        onClick={()=>{
          setPendingAction('habilitar');
          setToastMessage('¿Estás seguro que deseas habilitar el proyecto?');
          setToastType('warning');
          setToastOpen(true);
        }}
        >Habilitar projecto</Button>
      )
      :( <>
      
      {['investigador principal'].includes(role) && 
      <Button 
      color='danger' 
      onClick={()=>{
        setPendingAction('deshabilitar');
        setToastMessage('¿Estás seguro que deseas deshabilitar el proyecto?');
        setToastType('warning');
        setToastOpen(true);
      }}>Deshabilitar proyecto</Button>}

      {['investigador principal','editor'].includes(role) && <Button sx={{background: '#4f2621', color: 'white', '&:hover': { background: '#3e1f1c' }}} onClick={()=> setMembersOpen(open => !open)}>Administrar miembros</Button>}

      {['investigador principal'].includes(role) && project.status!=='completado' && 
      <Button 
      onClick={()=>{
        setPendingAction('completar');
        setToastMessage('¿Estás seguro que deseas marcar el proyecto como completado?');
        setToastType('success');
        setToastOpen(true);
      }}>Marcar projecto como "Completado"</Button>}
      </>)}

      { ['editor','colaborador'].includes(role) && !isBlocked &&
        <Button 
        color='danger' 
        onClick={()=>{
          setPendingAction('abandonar');
          setToastMessage('¿Estás seguro que deseas abandonar el proyecto?');
          setToastType('warning');
          setToastOpen(true);
        }}
        >Abandonar proyecto</Button> }

      </Stack>
      
       {membersOpen &&
        <ProjectMembersManager
          members={members}
          role={role}
          projectId={projectId}
          refreshMembers={refreshMembers}/>
      }

      <InfoToast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        showConfirm={!!pendingAction}
        showCancel={!!pendingAction}
        onConfirm={async () => {
          setToastOpen(false);
          if (pendingAction === 'habilitar') await handleProjectStatus('activo');
          if (pendingAction === 'abandonar') await handleLeaveProject();
          if (pendingAction === 'completar') await handleProjectStatus('completado');
          if (pendingAction === 'deshabilitar') await handleProjectStatus('deshabilitado');
          setPendingAction(null);
        }}
        onCancel={() => {
          setToastOpen(false);
          setPendingAction(null);
        }}
        onClose={() => {
          setToastOpen(false);
          setPendingAction(null);
        }}
      />


    <BasicFormModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title="Editar proyecto"
      description="Modifica los detalles del proyecto"
      fields={editFields}
      values={editValues}
      onChange={handleEditChange}
      onSubmit={handleEdit}
    />
    </Box>
  )
}

export default ProjectManage
