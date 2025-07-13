/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import Stack from '@mui/joy/Stack';
import Skeleton from '@mui/joy/Skeleton';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import CardContent from '@mui/joy/CardContent';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import Tooltip from '@mui/joy/Tooltip';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Visibility from '@mui/icons-material/Visibility';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useProject } from '../../hooks/useProject';
import { AssignArticleModal } from '../../components/assignModal';
import axios from 'axios'
import { useParams } from 'react-router-dom';
import InfoToast from '../../components/InfoToast';

const ProjectLibrary = () => {
  const {projectId}=useParams();
  const { articles, role, loading, 
          project, fetchAssignments, 
          assignments, fetchArticles, baseform } = useProject();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('todos');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [articleToAssign, setArticleToAssign] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
  const isBlocked = project && ['completado', 'deshabilitado'].includes(project.status);

  useEffect(() => {
    fetchAssignments(projectId);
    fetchArticles(projectId);
  }, [projectId, project]);
  
  const isAssigned = (articleId) =>
  Object.values(assignments).some(
    a =>
      a.articleId &&
      a.articleId._id === articleId &&
      a.reviewerId && 
      a.status !== 'no asignado'  
  );
const filteredArticles = articles.msg
    ? []
    : articles
        .filter(article => {
          if (filter === 'todos' || filter === null) return true;
          return article.status === 'aceptado';
        })
        .filter(article => {
          if (filter === 'libres') return !isAssigned(article._id);
          if (filter === 'tomados') return isAssigned(article._id);
          return true;
        });

const normalizeLanguage = (lang) => {
  try {
    const displayNames = new Intl.DisplayNames(['es'], { type: 'language' });
    if (Array.isArray(lang)) {
      return lang.map(l => displayNames.of((l || '').toLowerCase())).join(', ');
    }
    return displayNames.of((lang || '').toLowerCase());
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return lang;
  }
};

  const cleanAbstract = (abstract) => {
    if (!abstract || abstract === 'Abstract no disponible') return abstract;
    return abstract.replace(/<[^>]*>/g, '');
  };

  const openArticleModal = (article) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };


  const handleAssignArticle = (article) => {
    setArticleToAssign(article);
    setAssignModalOpen(true);
    console.log('Asignar artículo:', article);
  };

  const handleAssignToMember = async (memberId) => {
    setAssignLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP_SERVER_URL}/asignacion/project/${projectId}/new/${articleToAssign}`,
        {memberId},
        {withCredentials:true}
      )
      fetchAssignments(projectId);
      setAssignLoading(false);
      setAssignModalOpen(false);
      setToast({ 
        open: true, 
        message: 'Artículo asignado correctamente.', 
        type: 'success' 
      });
    } catch (error) {
      console.log(error)
      setAssignLoading(false);
      setToast({ open: true, message: 'Error al asignar el artículo.', type: 'error' });
    }
  };

    const handleReassignArticle = (article) => {
    setArticleToAssign(article);
    setAssignModalOpen(true);
    console.log('Asignar artículo:', article);
  };
    const handlerReassignToMember = async (memberId) => {
      setAssignLoading(true);
      try {
        const assignment = assignments.find(
          a => a.articleId && a.articleId._id === articleToAssign
        );
        if (!assignment) {
          throw new Error('No se encontró la asignación para este artículo.');
        }
        await axios.patch(
          `${import.meta.env.VITE_APP_SERVER_URL}/asignacion/project/${projectId}/assignment/${assignment._id}/revoke?change=true`,
          { reviewerId: memberId },
          { withCredentials: true }
        );
        fetchAssignments(projectId);
        setAssignLoading(false);
        setAssignModalOpen(false);
        setToast({ 
          open: true, 
          message: 'Artículo reasignado correctamente.', 
          type: 'success' 
        });
      } catch (error) {
        console.log(error);
        setAssignLoading(false);
        setToast({ 
          open: true, 
          message: 'Error al reasignar el artículo.', 
          type: 'error' 
        });
      }
    };

  const handleTakeArticle = async (articleId) => {
    setAssignLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP_SERVER_URL}/asignacion/project/${projectId}/new/${articleId}`,
        {},
        {withCredentials:true}
      )
      fetchAssignments(projectId);
      setAssignLoading(false);
      setToast({ 
        open: true, 
        message: 'Artículo tomado correctamente.', 
        type: 'success' 
      });
    } catch (error) {
      console.log(error)
      setAssignLoading(false);
      setToast({ 
        open: true, 
        message: 'Error al tomar el artículo.', 
        type: 'error' 
      });
    }
  };

  const getAssignedUserName = (articleId) => {
    const assignment = assignments.find(
      a =>
        a.articleId &&
        a.articleId._id === articleId &&
        a.reviewerId &&
        a.status !== 'no asignado'
    );
    if (!assignment || !assignment.reviewerId) return null;
    const member = project?.members?.find(
      m => m.userId && assignment.reviewerId && m.userId._id === assignment.reviewerId._id
    );
    return member && member.userId ? member.userId.name : (assignment.reviewerId.name || 'Usuario desconocido');
  };

  const getPreviousAssigned= (articleId) => {
  const prevAssignment = assignments.find(
    a =>
      a.articleId &&
      a.articleId._id === articleId &&
      !a.reviewerId &&
      a.status === 'no asignado' &&
      a.assignedBy
  );
  if (!prevAssignment) return false;
 
  return true
};

  return (
    <Box component="main" sx={{ p: 3, maxWidth: 1200, mx: 'auto', border: '1px dashed grey' }}>
      <h2>Artículos añadidos al proyecto</h2>
      <Box sx={{ mb: 2, display:'flex', flexDirection:'row'}}>
        <label htmlFor="filter-select" style={{ marginRight: 8 }}>Filtrar:</label>
        <Select
          id="filter-select"
          value={filter}
          onChange={(_, value) => setFilter(value)}
          size="sm"
          sx={{ minWidth: 60 }}
        >
          <Option value='todos'>Todos</Option>
          <Option value="libres">Libres</Option>
          <Option value="tomados">Tomados</Option>
        </Select>
      </Box>
      {loading ? (
        <Stack spacing={2} useFlexGap sx={{ maxWidth: '60ch' }}>
          <Box sx={{ m: 'auto' }}>
            <Typography level="h1" sx={{ fontSize: 'xl', position: 'relative', overflow: 'hidden' }}>
              <Skeleton loading={loading}>A heading</Skeleton>
            </Typography>
            <Typography level="body-xs" sx={{ mt: 1, mb: 2, position: 'relative', overflow: 'hidden' }}>
              <Skeleton loading={loading}>HISTORY, PURPOSE AND USAGE</Skeleton>
            </Typography>
            <Typography sx={{ position: 'relative', overflow: 'hidden' }}>
              <Skeleton loading={loading}>
                <i>Lorem ipsum</i> is placeholder text commonly used in the graphic,
                print, and publishing industries for previewing layouts and visual
                mockups.
              </Skeleton>
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Stack spacing={2}>
          {articles.msg ? (
            <Typography>{articles.msg}</Typography>
          ) : (
            filteredArticles.map((article, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Box sx={{ flex: 1 }}>
                    <Typography level="title-md" sx={{ mb: 1 }}>
                      {article.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
                      {article.year && <Chip size="sm" variant="soft">{article.year}</Chip>}
                      {article.publicationType !== 'No definido' && (
                        <Chip size="sm" variant="soft">{article.publicationType}</Chip>
                      )}
                      {article.language && article.language.length > 0 && (
                        <Chip size="sm" variant="soft" color="neutral">
                          {normalizeLanguage(article.language)}
                        </Chip>
                      )}
                      <Chip size="sm" variant='solid' color={article.status === 'aceptado' ? 'success' : article.status === 'rechazado' ? 'danger' : 'neutral'}>
                          {article.status}
                      </Chip>
                    </Stack>
                    <Typography level="body-sm" sx={{ mb: 1, color: 'text.secondary' }}>
                      {article.authors?.slice(0, 3).map(author => author.name).join(', ')}
                      {article.authors?.length > 3 && ` y ${article.authors.length - 3} más`}
                    </Typography>
                    {article.abstract && (
                      <Typography level="body-sm" sx={{ mb: 2 }}>
                        {cleanAbstract(article.abstract)?.substring(0, 200)} ...
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                          size="sm"
                          variant="outlined"
                          onClick={() => openArticleModal(article)}
                          startDecorator={<Visibility />}
                        >
                          Ver detalles
                        </Button>
                        {['investigador principal', 'editor'].includes(role) && article.status ==='aceptado' ? (
                          isAssigned(article._id) ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="sm" variant="solid" color="primary">
                              Asignado a: {getAssignedUserName(article._id)}
                            </Chip>
                            <Button
                              size="sm"
                              variant="soft"
                              sx={{ background: '#4f2621' }}
                              color="white"
                              disabled={isBlocked || baseform.msg? true:false}
                              onClick={() => handleReassignArticle(article._id)}
                            >
                              Reasignar
                            </Button>
                            </Stack>
                          ) : (
                            <Stack direction='row' spacing={2}>
                            <Button
                              size="sm"
                              variant="soft"
                              sx={{ background: '#4f2621' }}
                              color="white"
                              disabled={isBlocked || baseform.msg? true:false}
                              onClick={() => handleAssignArticle(article._id)}
                            >
                              {baseform.msg ? (
                                <Tooltip title='Crea el formulario base para asignar artículos'>
                                  <span>
                                  <PriorityHighIcon/>
                                  </span>
                                  </Tooltip>
                              ) : 'Asignar a'}
                            </Button>
                            {getPreviousAssigned(article._id) && article.status ==='aceptado' && (
                              <Chip size="sm" variant="soft" color="warning">
                                Este artículo fue revisado previamente por otro miembro
                              </Chip>
                            )}
                            </Stack>
                          )
                        ) : (
                          isAssigned(article._id) ? (
                            <Chip size="sm" variant="solid" color="primary">
                              Tomado por: {getAssignedUserName(article._id)}
                            </Chip>
                          ) : (
                          <Stack direction='row' spacing={2}>
                            {article.status ==='aceptado'&&  <Button
                              size="sm"
                              variant="soft"
                              color="success"
                              disabled={isBlocked || baseform.msg? true:false}
                              onClick={() => handleTakeArticle(article._id)}
                            >
                              {baseform.msg ? (
                                <Tooltip title='Aún no existe formulario base!'>
                                  <span>
                                  <PriorityHighIcon/>
                                  </span>
                                  </Tooltip>
                              ) : 'Tomar artículo'}
                            </Button>}
                            {getPreviousAssigned(article._id) && article.status ==='aceptado'&& (
                              <Chip size="sm" variant="soft" color="warning">
                                Este artículo fue revisado previamente por otro miembro 
                              </Chip>
                            )}
                            </Stack>
                          )
                        )}
                        {article.doiUrl && (
                          <Button
                            size="sm"
                            variant="plain"
                            component="a"
                            href={article.doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver artículo completo
                          </Button>
                        )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <ModalDialog size="lg" sx={{ maxWidth: 1000, maxHeight: '90vh', overflow: 'auto' }}>
                <ModalClose />
                {selectedArticle && (
                  <Box>
                    <Typography level="h3" sx={{ mb: 2 }}>
                      {selectedArticle.title}
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedArticle.year && <Chip variant="soft">{selectedArticle.year}</Chip>}
                        {selectedArticle.journal && (
                          <Chip variant="soft" color="primary">{selectedArticle.journal}</Chip>
                        )}
                        {selectedArticle.publisher && (
                          <Chip variant="soft" color="neutral">{selectedArticle.publisher}</Chip>
                        )}
                      </Stack>
      
                      <Divider />
      
                      <Box>
                        <Typography level="title-sm" sx={{ mb: 1 }}>Autores:</Typography>
                        <Typography level="body-md">
                          {selectedArticle.authors.map(author => author.name).join(', ')}
                        </Typography>
                      </Box>
      
                      {selectedArticle.abstract && (
                        <Box>
                          <Typography level="title-sm" sx={{ mb: 1 }}>Abstract:</Typography>
                          <Typography level="body-md">
                            {cleanAbstract(selectedArticle.abstract)}
                          </Typography>
                        </Box>
                      )}
      
                      <Box>
                        <Typography level="title-sm" sx={{ mb: 1 }}>Información de publicación:</Typography>
                        <Stack spacing={1}>
                          {selectedArticle.publicationType && (
                            <Typography level="body-sm">Tipo de publicación: {selectedArticle.publicationType}</Typography>
                          )}
                          {selectedArticle.doi && (
                            <Typography level="body-sm">DOI: {selectedArticle.doi}</Typography>
                          )}
                          {selectedArticle.language && (
                            <Typography level="body-sm">Idioma:{normalizeLanguage(selectedArticle.language)}</Typography>
                          )}
                          {selectedArticle.pages && (
                            <Typography level="body-sm">Páginas: {selectedArticle.pages}</Typography>
                          )}
                          {selectedArticle.volume && (
                            <Typography level="body-sm">Volúmen: {selectedArticle.volume}</Typography>
                          )}
                          {selectedArticle.issue && (
                            <Typography level="body-sm">Número: {selectedArticle.issue}</Typography>
                          )}
                        </Stack>
                      </Box>
      
                      <Box>
                        <Typography level="title-sm" sx={{ mb: 1 }}>Métricas:</Typography>
                        <Stack direction="row" spacing={2}>
                          {selectedArticle.citationCount && (
                            <Chip variant="soft" color="success">
                             {selectedArticle.citationCount} citas
                            </Chip>
                          )}
                          {selectedArticle.referenceCount && (
                            <Chip variant="soft" color="warning">
                              {selectedArticle.referenceCount} referencias
                            </Chip>
                          )}
                        </Stack>
                      </Box>
      
                      {selectedArticle.doiUrl && (
                        <Button
                          component="a"
                          href={selectedArticle.doiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mt: 2 }}
                        >
                          Ver artículo completo
                        </Button>
                      )}
                    </Stack>
                  </Box>
                )}
              </ModalDialog>
              {/* modal de asignacion*/}
            </Modal>
            <AssignArticleModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        members={project?.members || []}
        onAssign={isAssigned(articleToAssign)
          ? handlerReassignToMember
          : handleAssignToMember}
        loading={assignLoading}
      />
      <InfoToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </Box>
  );
}

export default ProjectLibrary;
