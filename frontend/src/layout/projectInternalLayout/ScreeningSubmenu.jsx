/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import InfoToast from "../../components/InfoToast";
import CriteriaModal from "../../components/CriteriaModal";
import axios from "axios";
import Input from "@mui/joy/Input";
import { useParams } from "react-router-dom";
import { useProject } from "../../hooks/useProject";
import ArticleDetailsModal from '../../components/ArticleDetails';
import Visibility from '@mui/icons-material/Visibility';

const ScreeningSubmenu = () => {
  const { project, articles, role, fetchArticles } = useProject();
  const { projectId } = useParams();
  const [criteria, setCriteria] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalArticleOpen, setModalArticleOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [comments, setComments] = useState({});

  useEffect(() => {
    setCriteria(project.screeningCriteria || []);
    fetchArticles(projectId)
  }, [project, projectId, articles, loading]);

  const handleSaveCriteria = async (newCriteria) => {
        try {
          await axios.patch(
            `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/edit/${projectId}`,
            { screeningCriteria: newCriteria },
            { withCredentials: true }
          );
          setToast({ open: true, message: 'Criterios guardados correctamente.', type: 'success' });
          setCriteria(newCriteria);
          setModalOpen(false);
        } catch (error) {
          console.error(error);
          setToast({ open: true, message: 'Error al guardar los criterios.', type: 'error' });
        }
  };


  const handleAcceptArticle = (articleId) => {
    setLoading(true);
    try {
      axios.patch(
        `${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${projectId}/article/screening/${articleId}`,
        {status: 'aceptado', criteriaNotes: comments[articleId] || ''},
        { withCredentials: true }
      );
      setSelectedArticle(null);
    } catch (error) {
      console.log(error);
      setToast({ open: true, message: 'Error al aceptar el artículo.', type: 'error' });
    }
    setLoading(false);
    setToast({ open: true, message: 'Artículo aceptado.', type: 'success' });
  };

  const handleOpenArticle = (article) => {
    setSelectedArticle(article);
    setModalArticleOpen(true);
  };

  const handleRejectArticle = (articleId) => {
    setLoading(true);
    setSelectedArticle(null);
    try {
      axios.patch(
        `${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${projectId}/article/screening/${articleId}`,
        {status: 'descartado', criteriaNotes: comments[articleId] || ''},
        { withCredentials: true }
      );
      setSelectedArticle(null);
    } catch (error) {
      console.log(error);
      setToast({ open: true, message: 'Error al rechazar el artículo.', type: 'error' }); 
      
    }
    setToast({ open: true, message: 'Artículo rechazado.', type: 'warning' });
  };

    const cleanAbstract = (abstract) => {
    if (!abstract || abstract === 'Abstract no disponible') return abstract;
    return abstract.replace(/<[^>]*>/g, '');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <h2>Cribado de artículos</h2>
      <Stack direction="row" spacing={4} alignItems="flex-start">
        {/* Columna de artículos */}
        <Box sx={{ flex: 2 }}>
          {loading ? (
            <Typography>Cargando artículos...</Typography>
          ) : (
            <Stack spacing={2}>
            {articles.filter(article => article.status === 'pendiente').length === 0 && 
                  <Typography color="neutral" sx={{ mt: 2 }}>
                    No hay artículos pendientes para mostrar.
                  </Typography>}
              {articles.filter(article => article.status === 'pendiente').map((article, idx) => (
                <Card key={idx} variant="outlined">
                  <CardContent>
                    <Typography level="title-md">{article.title}</Typography>
                    <Typography level="body-sm" sx={{ mb: 1 }}>{cleanAbstract(article.abstract)?.substring(0, 200) || 'Sin resumen'}...</Typography>
                    <Typography level="body-xs" sx={{ mb: 1 }}>
                      Autor: {article.authors?.map(a => a.name).join(', ')}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      {article.year && <Typography level="body-xs">Año: {article.year}</Typography>}
                      {article.publicationType && <Typography level="body-xs">Tipo: {article.publicationType}</Typography>}
                      {article.publisher && <Typography level="body-xs">Publisher: {article.publisher}</Typography>}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 , display: 'flex', justifyContent: 'space-between'}}>
                     <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}> <Button size="sm" color="success" onClick={() => handleAcceptArticle(article._id)}>
                                                Aceptar</Button>
                      <Button size="sm" color="danger" onClick={() => handleRejectArticle(article._id)}>
                                                Rechazar</Button>
                      </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Button size="sm" color="secondary" onClick={() => handleOpenArticle(article)} startDecorator={<Visibility />}>Ver detalles</Button>
                      <Input  placeholder="Añadir comentario"
                              value={comments[article._id] || ""}
                              onChange={e =>
                                setComments(prev => ({
                                  ...prev,
                                  [article._id]: e.target.value
                                }))
                              } />
                              </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>


        {/* criterios */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <h2>Criterios de cribado</h2>
          <Stack spacing={2}>
            {criteria.map((c, idx) => (
              <Box key={idx} sx={{ p: 2, bgcolor: '#f8f8f8', borderRadius: 2 }}>
                <Typography level="body-sm"  sx={{
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line',
                        overflowWrap: 'break-word',
                        maxWidth: '100%',
                      }} >{c} <br/></Typography>
              </Box>
            ))}
          </Stack>
          {["investigador principal", 'editor'].includes(role) && 
            <Button sx={{ mt: 1, bgcolor: '#4f2621' }} onClick={() => setModalOpen(true)}>Editar criterios</Button>
          }
        </Box>
      </Stack>
      
    <CriteriaModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title="Editar criterios de cribado"
      description="Agrega, edita o elimina los criterios de aceptación."
      criteria={criteria}
      onSave={handleSaveCriteria}/>

      <ArticleDetailsModal
      open={modalArticleOpen}
      onClose={() => setModalArticleOpen(false)}
      article={selectedArticle}/>

      <InfoToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}/>
    </Box>
  );
};

export default ScreeningSubmenu;
