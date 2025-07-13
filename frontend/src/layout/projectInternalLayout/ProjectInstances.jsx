/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import Box from '@mui/joy/Box';
import { useProject } from '../../hooks/useProject';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../../hooks/useAuth';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'
import BasicFormModal from '../../components/FormModal';
import { transformArticlePayload } from '../../utils/articleTransform';
import InfoToast from '../../components/InfoToast';


const ProjectInstances = () => {
  const {projectId} = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const{ assignments, role, fetchAssignments,project} = useProject();
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [userFilter, setUserFilter] = useState(user.userId);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [editArticleId, setEditArticleId] = useState(null);
  const [reloadAssignments, setReloadAssignments] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
  const isBlocked = project && ['completado', 'deshabilitado'].includes(project.status);

const editFields = [
 { name: 'title', label: 'Título', type: 'textarea', required: true },
  { name: 'abstract', label: 'Resumen', type: 'textarea', required: false },
  { name: 'year', label: 'Año', type: 'number', required: false },
  { name: 'journal', label: 'Revista', type: 'text', required: false },
  { name: 'publisher', label: 'Editorial', type: 'text', required: false },
  { name: 'doi', label: 'DOI', type: 'text', required: false },
  { name: 'doiUrl', label: 'URL DOI', type: 'text', required: false },
  { name: 'publicationType', label: 'Tipo de publicación', type: 'text', required: false },
  { name: 'volume', label: 'Volumen', type: 'text', required: false },
  { name: 'issue', label: 'Número', type: 'text', required: false },
  { name: 'pages', label: 'Páginas', type: 'text', required: false },
  { name: 'language', label: 'Idioma(s)', type: 'text', required: false },
  { name: 'keywords', label: 'Palabras clave', type: 'text', required: false },
  { name: 'authors', label: 'Autores', type: 'text', required: false },
  { name: 'referenceCount', label: 'Cantidad de referencias', type: 'number', required: false },
  { name: 'citationCount', label: 'Cantidad de citas', type: 'number', required: false },
  { name: 'is_oa', label: 'Acceso abierto', type: 'checkbox', required: false },
  { name: 'openAccessURL', label: 'URL de OpenAccess', type: 'text', required: false },
  { name: 'source', label: 'Fuente', type: 'text', required: false },
];

  useEffect(()=>{
    fetchAssignments(projectId);
}, [projectId, reloadAssignments, project]);

  const getFilteredAssignments = () => {
  const arr = Object.values(assignments || {});
  return arr.filter(a => {
    const matchesUser = !userFilter || (a.reviewerId && a.reviewerId._id === userFilter);
    const matchesPriority = !priorityFilter || a.priority === priorityFilter;
    return matchesUser && matchesPriority;
  });
};
  const filteredAssignments = getFilteredAssignments();

  const handleEditChange = (e) => {
  setEditValues(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};

  const handleRemove = async (assignmentId) => {
    try {
      if(['investigador principal','editor'].includes(role)){
      await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/asignacion/project/${projectId}/assignment/${assignmentId}/revoke`,
        {},
        {withCredentials:true})
      }else {
        await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/asignacion/project/${projectId}/remove/assignment/${assignmentId}`,
        {},
        {withCredentials:true})
      }
        setReloadAssignments(prev => prev + 1);
        setToast({ 
          open: true, 
          message: 'Asignación eliminada correctamente.', 
          type: 'success' 
        });
    } catch (error) {
      console.log(error)
      setToast({ open: true, message: 'Error al eliminar la asignación.', type: 'error' });
    }
  }

  const handleEditMetadata = async (articleId) => {
    setEditArticleId(articleId)
    try {
      const {data:article}= await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${projectId}/one/${articleId}`,
        {withCredentials:true})
      setEditValues({
        title: article.title || '',
        abstract: article.abstract || '',
        year: article.year || '',
        journal: article.journal || '',
        publisher: article.publisher || '',
        doi: article.doi || '',
        doiUrl: article.doiUrl || '',
        publicationType: article.publicationType || '',
        volume: article.volume || '',
        issue: article.issue || '',
        pages: article.pages || '',
        language: Array.isArray(article.language) ? article.language.join(', ') : (article.language || ''),
        keywords: Array.isArray(article.keywords) ? article.keywords.join(', ') : (article.keywords || ''),
        authors: Array.isArray(article.authors) ? article.authors.map(a => a.name || a).join(', ') : (article.authors || ''),
        referenceCount: article.referenceCount || '',
        citationCount: article.citationCount || '',
        is_oa: !!article.is_oa,
        openAccessURL: article.openAccessURL || '',
        source: article.source || '',
      });
      setEditModalOpen(true);
    } catch (error) {
      console.log(error)
      setEditArticleId(null)
    }

  }

  const handleEditSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload= transformArticlePayload(editValues)
    await axios.patch(
      `${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${projectId}/article/modify/${editArticleId}`,
      payload,
      { withCredentials: true }
    );
    setEditModalOpen(false);
   fetchAssignments(projectId)
   setToast({ open: true, message: 'Metadatos actualizados correctamente.', type: 'success' });
  } catch (error) {
    console.log(error);
    setToast({ open: true, message: 'Error al actualizar los metadatos.', type: 'error' });
  }
};

  const handleChangePriority = async (assignmentId, newPriority) =>{
    try {
      await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/asignacion/project/${projectId}/update/${assignmentId}`,
        {priority: newPriority},
        {withCredentials:true}
      )
      fetchAssignments(projectId);
      setToast({ open: true, message: 'Prioridad actualizada correctamente.', type: 'success' });
    } catch (error) {
      console.log(error)
      setToast({ open: true, message: 'Error al actualizar la prioridad.', type: 'error' });
    }
  }

return (
  <Box component="main" sx={{ p: 3, maxWidth: 1200, mx: 'auto',border: '1px dashed grey'}}>
    <Stack direction='row' spacing={10}>
    <h2>Asignaciones</h2>
    <Dropdown>
      <MenuButton startDecorator={<ArrowDropDown/>} color='white' sx={{background: '#4f2621'}}>Prioridad</MenuButton>
      <Menu>
        <MenuItem onClick={() => setPriorityFilter('alta')}>Alta</MenuItem>
        <MenuItem onClick={() => setPriorityFilter('media')}>Media</MenuItem>
        <MenuItem onClick={() => setPriorityFilter('baja')}>Baja</MenuItem>
        <MenuItem onClick={() => setPriorityFilter(null)}>Todas</MenuItem>
      </Menu>
    </Dropdown>
    {['investigador principal','editor'].includes(role) && 
    <Dropdown>
      <MenuButton startDecorator={<ArrowDropDown/>} color='white' sx={{background: '#4f2621'}}>Filtrar por</MenuButton>
      <Menu>
        <MenuItem onClick={() => setUserFilter(user.userId)}>Mis asignaciones</MenuItem>
        <MenuItem onClick={() => setUserFilter(null)}>Todas las asignaciones del projecto</MenuItem>
      </Menu>
    </Dropdown>
    }
    </Stack>
      <Stack spacing={2} mt={4}>
        {filteredAssignments.length === 0 ? (
          <Box>No hay asignaciones para mostrar, revisa artículos en la biblioteca del proyecto</Box>
          ) : (
            filteredAssignments.map((a, idx) => (
              <Stack 
                key={idx}
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 10,
                  contentVisibility:'auto',
                  p: 3,
                  background: '#f9f9f9',
                }}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  p: 2,
                  background: '#f9f9f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <strong>Artículo:</strong> {a.articleId?.title || 'Sin título'}
                <span>
                  <strong>Estado:</strong> {a.status}
                </span>
                      <span>
                    <strong>Prioridad:</strong> {a.priority}
                  </span>
                  {['investigador principal', 'editor'].includes(role) && (
                    <Stack direction='column'>
                    <span>
                      <strong>Asignado a:</strong> {a.reviewerId?.name || a.reviewerId?.email || 'Desconocido'}
                    </span>
                    <span>
                      <strong>Correo:</strong> {  a.reviewerId?.email || 'Desconocido'}
                      </span>
                      </Stack>
                  )}
                <Stack direction='row' gap='10px'>
                   { a.reviewerId===user.userId  &&
                   <Button disabled={isBlocked} size='md' sx={{ maxWidth: 200, height: 50 }} onClick={() => handleRemove(a._id)}>Eliminar asignación</Button> }
                  {a.reviewerId?._id === user.userId && (
                      <Button disabled={isBlocked} size='md' sx={{ maxWidth: 200, height: 50 }} onClick={() => navigate(`/analize/${a._id}/${projectId}/${a.articleId._id}`)}>
                        Analizar artículo
                      </Button> 
                  )}
                 
                  <Button disabled={isBlocked} size='md' sx={{maxWidth:200, height:50}} onClick={()=>handleEditMetadata(a.articleId._id)}>Editar metadatos</Button>
                  <Box sx={{ mb: 2, display:'flex', flexDirection:'column'}}>
                          <label htmlFor="priority-select" style={{ marginRight: 8 }}>Cambiar prioridad</label>
                          <Select
                            disabled={isBlocked}
                            id="priority-select"
                            value={a.priority}
                            onChange={(_, value) => handleChangePriority(a._id, value)}
                            size="sm"
                            sx={{ minWidth: 60 }}
                          >
                            <Option value="alta">Alta</Option>
                            <Option value="media">Media</Option>
                            <Option value="baja">Baja</Option>
                          </Select>
                  </Box>
                </Stack>
                </Box>
                </Stack>
              ))
            )}
          </Stack>
        <BasicFormModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar metadatos del artículo"
          description="Modifica los campos necesarios y guarda los cambios."
          fields={editFields}
          values={editValues}
          onChange={handleEditChange}
          onSubmit={handleEditSubmit}
        />
        <InfoToast
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(t => ({ ...t, open: false }))}
        />
    </Box>
  )
}

export default ProjectInstances