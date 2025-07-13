/* eslint-disable react-hooks/exhaustive-deps */
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button'
import { useProject } from '../../hooks/useProject';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Checkbox from '@mui/joy/Checkbox';
import Textarea from '@mui/joy/Textarea';
import  Divider from '@mui/joy/Divider';
import BaseFormModal from '../../components/baseForm';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'
import { useEffect } from 'react';

const ProjectBaseForm = () => {
  const {projectId} = useParams();
  const {baseform, role, postBaseForm, fetchBaseform, project} =useProject();
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fieldsToEdit, setFieldsToEdit] = useState([]);
  const [ token, setToken] = useState(null);
  const [expTime, setExpTime] =useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const isBlocked = project && ['completado', 'deshabilitado'].includes(project.status);

  useEffect(() => {
      if (baseform.comments) setComments(baseform.comments);
      const handleBeforeUnload = () => {
          if (token) {
              navigator.sendBeacon(`${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/${baseform._id}/cancel?token=${token}`, {},{withCredentials:true});
          }
      };
      fetchBaseform(projectId);
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [token, baseform._id, projectId, baseform.comments, project]);

  useEffect(() => {
    if (!modalOpen || !editMode || !expTime) return;
    const intervalId = setInterval(() => {
      setExpTime(prev => {
        if (prev <= 1) {
          setModalOpen(false);
          setEditMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [modalOpen, editMode, expTime]);

    //solicitar token para edicion
  const handleEditForm = async () => {
    try {
      const res= await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/editing/${baseform._id}`,
        {},
        { withCredentials: true })
      setToken(res.data.token)
      setExpTime(res.data.expiresIn)
      setFieldsToEdit(baseform.fields || []);
      setEditMode(true);
      setModalOpen(true);


    } catch (error) {
      console.log({project:projectId, baseform:baseform._id, url:`${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/editing/${baseform._id}`})
      console.log({erorr:error})

    }

  };

  const handleCreateForm = () => {
    setFieldsToEdit([]);
    setEditMode(false);
    setModalOpen(true);
  };

  // guardar formulario editado
  const handleUpdateForm = async (fields) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/update/${baseform._id}?token=${token}`,
        { fields },
        { withCredentials: true }
      );
      setModalOpen(false);
      setEditMode(false);
    } catch (error) {
      console.log(error);
    }
  };

  // guardar formulario nuevo
  const handleCreateFormSubmit = (fields) => {
    postBaseForm(projectId, fields);
    setModalOpen(false);
  };

  //revoca token para editar formulario base
  const handleCancel= async()=>{
    try {
      await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/${baseform._id}/cancel?token=${token}`,
        {},
        { withCredentials: true })
      setModalOpen(false)
    } catch (error) {
      console.log(error)
      setModalOpen(false)
    }
  }


  //añadir comentarios para los colaboradores
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/comment/${baseform._id}`,
        { comment: commentText },
        { withCredentials: true }
      );
      setComments(res.data.comments);
      setCommentText('');
    } catch (error) {
      console.log(error);
    }
  };


  //resolver comentarios para lider y editor
  const handleResolveComment = async (commentId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/comments/update/${commentId}`,
        { status: 'resuelto' },
        { withCredentials: true }
      );
      fetchBaseform(projectId);
    } catch (error) {
      console.log(error);
    }
  };

const renderField = (field, index) => {
  const isDisabled = field.enabled === false;

  const commonProps = {
    disabled: isDisabled,
    sx: isDisabled
      ? { borderColor: 'red', backgroundColor: '#ffeaea', color: 'red' }
      : {},
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems={field.type === 'textarea' ? 'flex-start' : 'center'}
      key={index}
      sx={{ mb: 2, opacity: isDisabled ? 0.6 : 1 }}
    >
      <Stack direction="column">
        <Typography level="body-md" color={isDisabled ? 'danger' : 'neutral'}>
          {field.label}
        </Typography>
        {(() => {
          switch (field.type) {
            case 'textarea':
              return <Textarea placeholder="Texto..." minRows={3} {...commonProps} />;
            case 'number':
              return <Input type="number" placeholder="Número..." {...commonProps} />;
            case 'select':
              return (
                <Select placeholder="Selecciona una opción" {...commonProps}>
                  {field.options?.map((opt, i) => (
                    <Option key={i} value={opt}>{opt}</Option>
                  ))}
                </Select>
              );
            case 'multiselect':
              return (
                <Select multiple placeholder="Selecciona opciones" {...commonProps}>
                  {field.options?.map((opt, i) => (
                    <Option key={i} value={opt}>{opt}</Option>
                  ))}
                </Select>
              );
            case 'boolean':
              return <Checkbox label="Sí / No" disabled={isDisabled} />;
            case 'date':
              return <Input type="date" {...commonProps} />;
            default:
              return null;
          }
        })()}
      </Stack>
      <Typography level="body-sm" color={isDisabled ? 'danger' : 'neutral'}>
        {field.helpText}
        {isDisabled && ' (Campo deshabilitado)'}
      </Typography>
    </Stack>
  );
};


  return (
    <Box component="main" sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <h2>Formulario del Proyecto</h2>
      <p>En esta sección deberás crear el formulario que servirá de guía para la extracción de información de los articulos para la revisión sistematica.</p>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>


        <Box sx={{ flex: 2, minWidth: 0 }}>
          {['investigador principal', 'editor'].includes(role) && !baseform.msg && (
            <Button disabled={isBlocked} onClick={handleEditForm} sx={{ mb: 2 }}>
              Editar formulario
            </Button>
          )}
          {baseform.msg ? (
            <Stack direction='column' sx={{ display: 'contents' }}>
              <Typography sx={{ p: 1 }}>{baseform.msg}</Typography>
              {['investigador principal'].includes(role) && baseform.msg && (
                <Button disabled={isBlocked} onClick={handleCreateForm}>Crear formulario guía</Button>
              )}
            </Stack>
          ) : (
            <Box component='section' mx='auto' sx={{ p: 4 }}>
              <Stack spacing={2}>
                {baseform.fields?.map((field, index) => renderField(field, index))}
              </Stack>
            </Box>
          )}
        </Box>


        <Box sx={{ flex: 1, minWidth: 0, bgcolor: '#f8f8f8', borderRadius: 3, p: 3, boxShadow: 'sm', height: 'fit-content' }}>
          <Typography level="h4" sx={{ mb: 2 }}>Comentarios</Typography>
          {baseform.status==='editing' && baseform.isActive === false && <Typography level='body-md'>El formulario base está siendo editado...</Typography>}
          <Box sx={{ maxHeight: 350, overflowY: 'auto', mb: 2 }}>
            <Stack spacing={2}>
              {[...comments]
                .sort((a, b) => {
                  if (a.status === b.status) return 0;
                  if (a.status === 'pendiente') return -1;
                  if (b.status === 'pendiente') return 1;
                  return 0;
                })
                .map((c) => (
                  <Box key={c._id} sx={{ bgcolor: '#fff', p: 2, borderRadius: 2 }}>
                    <Typography level="body-md">{c.comment}</Typography>
                    <Typography level="body-xs" sx={{ color: c.status === 'resuelto' ? 'success.main' : 'warning.main' }}>
                      Estado: {c.status}
                    </Typography>
                    {['investigador principal', 'editor'].includes(role) && c.status === 'pendiente' && (
                      <Button disabled={isBlocked} size="sm" color="success" onClick={() => handleResolveComment(c._id)}>
                        Marcar como resuelto
                      </Button>
                    )}
                  </Box>
                ))}
            </Stack>
          </Box>
          {['colaborador'].includes(role) && (
            <Box sx={{ mt: 2 }}>
              <Textarea
              disabled={baseform.status==='editing' && baseform.isActive === false}
                placeholder="Añade un comentario..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                minRows={2}
                sx={{ mb: 1 }}
              />
              <Button onClick={handleAddComment} disabled={isBlocked || !commentText.trim() ||(baseform.status==='editing' && baseform.isActive === false) }>
                Añadir comentario
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <BaseFormModal
        open={modalOpen}
        onClose={handleCancel}
        onCreate={handleCreateFormSubmit}
        onEdit={handleUpdateForm}
        editMode={editMode}
        initialFields={fieldsToEdit}
        timeLeft={expTime}
      />
    </Box>
  );
};
export default ProjectBaseForm;
