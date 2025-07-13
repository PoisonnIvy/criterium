import React, { useRef, useState } from 'react'
import Box from '@mui/joy/Box'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Button from '@mui/joy/Button'
import { RISparser } from '../../utils/RISparser'
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Divider from '@mui/joy/Divider';
import FileUploadTwoToneIcon from '@mui/icons-material/FileUploadTwoTone';
import axios from 'axios'
import { useProject } from '../../hooks/useProject'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import InfoToast from '../../components/InfoToast';
import CircularProgress from '@mui/material/CircularProgress';

const MAX_META_FILES = 10;
const MAX_ARTICLE_FILES = 10;
const isRISFile = file => file.name.toLowerCase().endsWith('.ris');

const ProjectLoadFile = () => {
  const {project, articles} = useProject();
  const [metadataFiles, setMetadataFiles] = useState([])
  const [articleFiles, setArticleFiles] = useState([])
  const metadataInputRef = useRef()
  const articleInputRef = useRef()
  const [dragOverMeta, setDragOverMeta] = useState(false)
  const [dragOverArticle, setDragOverArticle] = useState(false)
  const [parsedMetadata, setParsedMetadata] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfAssignments, setPdfAssignments] = useState([]); // [{file, articleId}]
  const [uploading, setUploading] = useState(false);
  const isBlocked = project && ['completado', 'deshabilitado'].includes(project.status);

  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'info'
  });

  const handleShowParsedMetadata = () => {
    if (metadataFiles.length === 0) return;
    Promise.all(metadataFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const risText = ev.target.result;
          const parsed = RISparser(risText);
          resolve({ fileName: file.name, records: parsed });
        };
        reader.readAsText(file);
      });
    })).then(results => {
      setParsedMetadata(results);
      setModalOpen(true);
    });
  };

  const handleMetaDrop = (e) => {
    e.preventDefault();
    setDragOverMeta(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > MAX_META_FILES) {
      setToast({ open: true, message: `Solo puedes subir hasta ${MAX_META_FILES} archivos.`, type: 'warning' });
      return;
    }
    const invalid = files.some(file => !isRISFile(file));
    if (invalid) {
      setToast({ open: true, message: 'Solo se permiten archivos RIS (.ris).', type: 'warning' });
      return;
    }
    setMetadataFiles(files);
  };

  const handleMetaFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (files.length > MAX_META_FILES) {
        setToast({ open: true, message: `Solo puedes subir hasta ${MAX_META_FILES} archivos.`, type: 'warning' });
        return;
      }
      const invalid = files.some(file => !isRISFile(file));
      if (invalid) {
        setToast({ open: true, message: 'Solo se permiten archivos RIS (.ris).', type: 'warning' });
        return;
      }
      setMetadataFiles(files);
    }
  };

  const handleMetaDragOver = (e) => {
    e.preventDefault()
    setDragOverMeta(true)
  }
  const handleMetaDragLeave = () => setDragOverMeta(false)

  const normalizeArticle = (article) => ({
    title: article.title || '',
    tags: article.tags || [],
    abstract: article.abstract || '',
    source: article.source || article.journal || article.publisher || '',
    pdfPath: article.pdfPath || '',
    is_oa: article.is_oa || false,
    openAccessURL: article.openAccessURL || '',
    other_url: article.other_url || [],
    doi: article.doi || '',
    doiUrl: article.doiUrl || '',
    otherIdentifiers: article.otherIdentifiers || {},
    publicationType: article.publicationType || 'journal-article',
    year: article.year || '',
    volume: article.volume || '',
    issue: article.issue || '',
    pages: article.pages || '',
    keywords: article.keywords || [],
    authors: Array.isArray(article.authors) ? article.authors.filter(a => a && a.name) : [],
    journal: article.journal || '',
    publisher: article.publisher || '',
    referenceCount: article.referenceCount || 0,
    citationCount: article.citationCount || 0,
    language: article.language || 'No definido'
  });

  const handleMetadataUpload = async ()=> {
    for (const file of parsedMetadata) {
      for (const data of file.records) {
        const normalized = normalizeArticle(data);
        if (!normalized.title || normalized.title.trim() === '') {
        console.warn('Un artículo fue omitido por falta de título:', normalized);
        setTimeout(() => {
          setToast({
            open: true,
            message: 'Artículo omitido por falta de título.',
            type: 'warning'
          });
      }, 3000);
        continue;
      }
        try {
          await axios.post(
            `${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${project._id}/article/add`,
            normalized,
            { withCredentials: true }
          );
        } catch (error) {
          if(error && error.status === 409){
            setToast({
            open: true,
            message: `Un artículo ya se encuentra en la biblioteca del proyecto y fue omitido`,
            type: 'info'
          });
          }
            setToast({
            open: true,
            message: `${error.response.data.message}`,
            type: 'info'
          });
        }
      }
    }
    setModalOpen(false)
  }
  
  //handlers para articulos
  const handleArticleDrop = (e) => {
    e.preventDefault();
    setDragOverArticle(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > MAX_ARTICLE_FILES) {
      setToast({ open: true, message: `Solo puedes subir hasta ${MAX_ARTICLE_FILES} archivos.`, type: 'warning' });
      return;
    }
    const invalid = files.some(file => file.type !== 'application/pdf');
    if (invalid) {
      setToast({ open: true, message: 'Solo se permiten archivos PDF.', type: 'warning' });
      return;
    }
    setArticleFiles(files);
  };

  const handleArticleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (files.length > MAX_ARTICLE_FILES) {
        setToast({ open: true, message: `Solo puedes subir hasta ${MAX_ARTICLE_FILES} archivos.`, type: 'warning' });
        return;
      }
      const invalid = files.some(file => file.type !== 'application/pdf');
      if (invalid) {
        setToast({ open: true, message: 'Solo se permiten archivos PDF.', type: 'warning' });
        return;
      }
      setArticleFiles(files);
    }
  };
  const handleMetaClick = () => metadataInputRef.current.click()


  const handleArticleDragOver = (e) => {
    e.preventDefault()
    setDragOverArticle(true)
  }
  const handleArticleDragLeave = () => setDragOverArticle(false)

  const handleArticleClick = () => articleInputRef.current.click()


  const handleOpenPdfModal = () => {
    setPdfAssignments(articleFiles.map(file => ({ file, articleId: '' })));
    setPdfModalOpen(true);
  };

  // Elimina un archivo de la lista
  const handleRemovePdfFile = (idx) => {
    setPdfAssignments(prev => prev.filter((_, i) => i !== idx));
  };

  // Cambia el artículo asignado a un PDF
  const handleAssignArticle = (idx, articleId) => {
    setPdfAssignments(prev =>
      prev.map((item, i) => i === idx ? { ...item, articleId } : item)
    );
  };

  // subir todos los PDFs
  const handleUploadAllPdfs = async () => {
    setUploading(true);
    try {
      for (const { file, articleId } of pdfAssignments) {
        if (!articleId) continue;
        const formData = new FormData();
        formData.append('archivo', file);
        await axios.post(
          `${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${project._id}/article/upload/${articleId}`,
          formData,
          { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }
      setPdfModalOpen(false);
      setArticleFiles([]);
      setToast({ open: true, message: 'Archivos PDF subidos correctamente.', type: 'success' });
    } catch (error) {
      setToast({ open: true, message: 'Error al subir los archivos PDF.', type: 'error' });
      console.error(error);
    }
    setUploading(false);
  };

  return (
    <Box
      component="main"
      sx={{
        p: { xs: 1, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
        borderRadius: 4,
        minHeight: '80vh',
        border: 'none'
      }}
    >
      <h2 sx={{ mb: 1, color: 'var(--color-terracotta)', fontWeight: 700 }}>
        Documentos locales
      </h2>
      <p>
        En esta sección puedes subir metadatos en formato .RIS, así como también puedes cargar artículos en formato .PDF.
      </p>
      <p>
        Selecciona el tipo de archivo que quieras subir:
      </p>
    <Divider />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        sx={{
          justifyContent: 'space-evenly',
          alignItems: 'stretch',
          p: { xs: 2, md: 4 , mt: 2},
          borderRadius: 3,
          mb: 4,
          gap: 4
        }}
      >
        {/* dropzone metadatos */}
        <Stack
          direction='column'
          sx={{
            gap: 2,
            flex: 1,
            minWidth: 260,
            bgcolor: '#f8f9fa',
            borderRadius: 3,
            boxShadow: 'xs',
            p: 3,
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              minWidth: 250,
              minHeight: 150,
              border: dragOverMeta ? '2px solid var(--color-terracotta)' : '2px dashed #bdbdbd',
              borderRadius: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isBlocked? null:'pointer',
              bgcolor: dragOverMeta ? '#ffe6e0' : '#fafafa',
              transition: 'border 0.2s, background 0.2s',
              mb: 2
              
            }}
            onDrop={handleMetaDrop}
            onDragOver={handleMetaDragOver}
            onDragLeave={handleMetaDragLeave}
            onClick={isBlocked?null:handleMetaClick}
          >
            <input
              type="file"
              ref={metadataInputRef}
              style={{ display: 'none' }}
              onChange={handleMetaFileChange}
              multiple
              accept=".ris"
            />
            <UploadFileIcon sx={{ fontSize: 48, color: 'var(--color-terracotta)', mb: 1 }} />
            <span>
              Tipo de archivo permitido:<br /> <b>.RIS</b><br />
              Máximo {MAX_META_FILES} archivos
            </span>
            {metadataFiles.length > 0 ? (
              <Box>
                {metadataFiles.map((file, idx) => (
                  <Typography key={idx} level="body-xs">{file.name}</Typography>
                ))}
              </Box>
            ) : (
              <Typography level="body-xs" color="neutral" sx={{ mt: 1 }}>
                Arrastra o haz click para subir
              </Typography>
            )}
          </Box>
          <Button
            size='md'
            color="success"
            variant="solid"
            onClick={handleShowParsedMetadata}
            disabled={isBlocked || metadataFiles.length === 0}
            sx={{ width: '100%' }}
          >
            Cargar metadatos
          </Button>
          {metadataFiles.length > 0 && (
            <Button
              size='md'
              color='danger'
              onClick={() => setMetadataFiles([])}
              sx={{ width: '100%' }}
            >
              Cancelar
            </Button>
          )}
        </Stack>

        {/* dropzone articulos PDF */}
        <Stack
          direction='column'
          sx={{
            gap: 2,
            flex: 1,
            minWidth: 260,
            bgcolor: '#f8f9fa',
            borderRadius: 3,
            boxShadow: 'xs',
            p: 3,
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              minWidth: 250,
              minHeight: 150,
              border: dragOverArticle ? '2px solid var(--color-terracotta)' : '2px dashed #bdbdbd',
              borderRadius: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isBlocked? null : 'pointer',
              bgcolor: dragOverArticle ? '#ffe6e0' : '#fafafa',
              transition: 'border 0.2s, background 0.2s',
              mb: 2
            }}
            onDrop={handleArticleDrop}
            onDragOver={handleArticleDragOver}
            onDragLeave={handleArticleDragLeave}
            onClick={isBlocked? null :handleArticleClick}
          >
            <input
              type="file"
              ref={articleInputRef}
              style={{ display: 'none' }}
              onChange={handleArticleFileChange}
              multiple
              accept=".pdf"
            />
            <UploadFileIcon sx={{ fontSize: 48, color: 'var(--color-terracotta)', mb: 1 }} />
            <span>
              Tipo de archivo permitido: <br /><b>.PDF</b><br />
              Máximo {MAX_ARTICLE_FILES} archivos
            </span>
            {articleFiles.length > 0 ? (
              <Box>
                {articleFiles.map((file, idx) => (
                  <Typography key={idx} level="body-xs">{file.name}</Typography>
                ))}
              </Box>
            ) : (
              <Typography level="body-xs" color="neutral" sx={{ mt: 1 }}>
                Arrastra o haz click para subir
              </Typography>
            )}
          </Box>
          <Button
            size='md'
            color="primary"
            variant="solid"
            onClick={handleOpenPdfModal}
            disabled={isBlocked || articleFiles.length === 0}
            sx={{ width: '100%' }}
          >
            Subir artículos
          </Button>
          {articleFiles.length > 0 && (
            <Button
              size='md'
              color='danger'
              variant="soft"
              onClick={() => setArticleFiles([])}
              sx={{ width: '100%' }}
            >
              Cancelar
            </Button>
          )}
        </Stack>
      </Stack>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog sx={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto', bgcolor: 'background.body', borderRadius: 3 }}>
          <Stack direction='row' gap={10} alignItems="center" sx={{ mb: 2 }}>
            <Typography level="h4" sx={{ color: 'var(--color-terracotta)' }}>Detalles de los metadatos cargados</Typography>
            {uploading?(<CircularProgress color='inherit'/>):(<Button startDecorator={<FileUploadTwoToneIcon />} onClick={handleMetadataUpload} color="primary" variant="solid">
              Subir
            </Button>)}
          </Stack>
          <Typography level="body-xs" color="danger" sx={{ mt: 2 }}>
            Una vez cargados puedes editar la información
          </Typography>
          <Divider sx={{ my: 2 }} />
          {parsedMetadata.map((file, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Typography level="title-md" sx={{ color: 'var(--color-terracotta)' }}>{file.fileName}</Typography>
              {file.records.map((rec, i) => (
                <Box key={i} sx={{ mb: 1, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  {Object.entries(rec).map(([key, value]) => (
                    <Typography key={key} level="body-xs">
                      <b>{key}:</b> {Array.isArray(value) ? value.map(v => v.name || v).join(', ') : typeof value === 'object' ? JSON.stringify(value) : value}
                    </Typography>
                  ))}
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </Box>
          ))}
        </ModalDialog>
      </Modal>

      {/* MODAL PARA SUBIR PDFs */}
      <Modal open={pdfModalOpen} onClose={() => setPdfModalOpen(false)}>
        <ModalDialog sx={{ maxWidth: 700, maxHeight: '90vh', overflow: 'auto', bgcolor: 'background.body', borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography level="h4" sx={{ color: 'var(--color-terracotta)' }}>Asignar PDFs a artículos</Typography>
            {uploading?(<CircularProgress color='inherit'/>):( <Button
              size="md"
              color="primary"
              variant="solid"
              disabled={
                pdfAssignments.some(item => !item.articleId) ||
                pdfAssignments.length === 0
              }
              onClick={handleUploadAllPdfs}
            >
              Subir todos
            </Button>)}
          </Stack>
          {pdfAssignments.length === 0 && (
            <Typography color="danger">No hay archivos PDF para subir.</Typography>
          )}
          <Stack spacing={2}>
            {pdfAssignments.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2 }}>
                <PictureAsPdfIcon color="error" />
                <Typography sx={{ minWidth: 120 }}>{item.file.name}</Typography>
                <Select
                  size="sm"
                  value={item.articleId}
                  placeholder="Selecciona artículo"
                  onChange={(_, value) => handleAssignArticle(idx, value)}
                  sx={{ minWidth: 200 }}
                >
                  {articles?.map(article => (
                    <Option key={article._id} value={article._id}>
                      {article.title}
                    </Option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  color="danger"
                  variant="soft"
                  onClick={() => handleRemovePdfFile(idx)}
                  startDecorator={<CloseIcon />}
                >
                  Quitar
                </Button>
              </Box>
            ))}
          </Stack>
          <Typography level="body-xs" color="danger" sx={{ mt: 2 }}>
            Todos los archivos deben estar asignados a un artículo para poder subirlos.
          </Typography>
        </ModalDialog>
      </Modal>
      <InfoToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  )
}
export default ProjectLoadFile;