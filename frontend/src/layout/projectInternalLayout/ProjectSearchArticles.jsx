import { useEffect, useState } from 'react'
import InfoToast from '../../components/InfoToast';
import axios from 'axios'
import { useParams } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Chip from '@mui/joy/Chip';
import Checkbox from '@mui/joy/Checkbox';
import Stack from '@mui/joy/Stack';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Skeleton from '@mui/joy/Skeleton';
import CircularProgress from '@mui/joy/CircularProgress';
import { Search, BookmarkAdd, Visibility} from '@mui/icons-material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useProject } from '../../hooks/useProject';

const ProjectArticles = () => {
  const {projectId}=useParams();
  const {project} =useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [oa, setOa] = useState({})
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
  const [loadDetails, setLoadDetails] = useState(false);
  const isBlocked = project && ['completado', 'deshabilitado'].includes(project.status);

  
  const [filters, setFilters] = useState({
    hasAbstract: false,
    fromDate: '',
    untilDate: ''
  });

  useEffect(() => {
  }, [filters, currentPage, projectId, project])


  const searchArticles = async (page = 1) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const params = {
        title: searchQuery,
        page: page.toString(),
        limit: 50,
        filter: {
          abstract: filters.hasAbstract,
          yearFrom: filters.fromDate || undefined,
          yearTo: filters.untilDate || undefined,
        }
      }

      const response = await axios.get(
        `${import.meta.env.VITE_APP_SERVER_URL}/websearch/crossref/${projectId}`,
        { params, withCredentials: true})
      
      if(response.data.status === 'completado') {
        setArticles(response.data.works);
        setCurrentPage(page);
        setTotalResults(response.data.totalResults)
      } else {
        setArticles([]);
        setTotalResults(0);
      }
    } catch (error) {  
      setArticles([]);
      setTotalResults(0);
      console.error('Error searching articles:', error);
    } finally {
      setLoading(false);
    }
  };


  const toggleArticleSelection = (articleIndex) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleIndex)) {
      newSelected.delete(articleIndex);
    } else {
      newSelected.add(articleIndex);
    }
    setSelectedArticles(newSelected);
  };


  const saveSelectedArticles = async () => {
    if (selectedArticles.size === 0) return;
    
    setSaving(true);
    try {
      const articlesToSave = Array.from(selectedArticles).map(index => articles[index]);
      
        const response = await axios.post(
          `${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${projectId}/addBulk`,
          {articles: articlesToSave},{ withCredentials: true }
        );

      if (response) {
        setSelectedArticles(new Set());
        setToast({ open: true, message: `${articlesToSave.length} artículos guardados exitosamente`, type: 'success' });
      }
    } catch (error) {
      console.error('Error saving articles:', error);
      setToast({ open: true, message: 'Error al guardar los artículos', type: 'error' });
    } finally {
      setSaving(false);
    }
  };


  const openArticleModal = (article) => {
    setSelectedArticle(article);
    setModalOpen(true);
    setLoadDetails(true);
    try {
      const fetchOA= async()=>{
        const res= await axios.post(`${import.meta.env.VITE_APP_SERVER_URL}/websearch/unpaywall/data/${projectId}`,
          [article.doi.toString()], {withCredentials:true})
        
        setOa(res.data.results[0]) //results es un array de objetos
        setLoadDetails(false);
      }
      fetchOA();
    } catch (error) {
      setOa({msg:'No se ha podido cargar informacion OpenAccess'})
      console.log(error)
    }
  };

  const normalizeLanguage = (lang)=>{
    if(lang === 'No definido' || lang === null || lang === undefined) return 'No definido'

     try {
      const displayNames = new Intl.DisplayNames(['es'], { type: 'language' });
      const resultado = displayNames.of((lang || '').toLowerCase());
      return resultado
     } catch (e) {
      console.error(e)
      return lang;
     }

  
  }

 
  const cleanAbstract = (abstract) => {
    if (!abstract || abstract === 'Abstract no disponible') return abstract;
    return abstract.replace(/<[^>]*>/g, '');
  };

  return (
    <Box component="main" sx={{ p: 3, maxWidth: 1200, mx: 'auto',border: '1px dashed grey' }}>
      <h2>
        Buscar Artículos Académicos
      </h2>


      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="end">
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Buscar por título</FormLabel>
                <Input
                  disabled={isBlocked}
                  placeholder="Ingresa el título del artículo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchArticles()}
                  endDecorator={
                    <IconButton onClick={() => searchArticles()} disabled={loading}>
                      {loading ? <CircularProgress size="sm" /> : <Search />}
                    </IconButton>
                  }
                />
              </FormControl>
              <Button
                disabled={isBlocked}
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startDecorator={<FilterAltIcon />}
              >
                Filtros
              </Button>
            </Stack>

            {/*filtros*/}
            {showFilters && (
              <Card variant="soft">
                <CardContent>
                  <Stack spacing={2}>
                    <Typography level="title-sm">Filtros de búsqueda</Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Checkbox
                        label="Solo con abstract"
                        checked={filters.hasAbstract}
                        onChange={(e) => setFilters({...filters, hasAbstract: e.target.checked})}
                      />
                      <FormControl size="sm">
                        <FormLabel>Desde año</FormLabel>
                        <Input
                          type="number"
                          placeholder="2020"
                          value={filters.fromDate}
                          onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                        />
                      </FormControl>
                      <FormControl size="sm">
                        <FormLabel>Hasta año</FormLabel>
                        <Input
                          type="number"
                          placeholder="2024"
                          value={filters.untilDate}
                          onChange={(e) => setFilters({...filters, untilDate: e.target.value})}
                        />
                      </FormControl>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* guardar seleccionados */}
      {selectedArticles.size > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography level="body-md">
                {selectedArticles.size} artículo(s) seleccionado(s)
              </Typography>
              <Button
                onClick={saveSelectedArticles}
                disabled={saving}
                startDecorator={saving ? <CircularProgress size="sm" /> : <BookmarkAdd />}
              >
                {saving ? 'Guardando...' : 'Guardar en Biblioteca'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* mappear resultados */}
      {totalResults > 0 && (
        <Typography level="body-sm" sx={{ mb: 2 }}>
          {totalResults.toLocaleString()} resultados encontrados
        </Typography>
      )}
{loading? (
              <Stack spacing={2} useFlexGap sx={{ maxWidth: '60ch' }}>
      <Box sx={{ m: 'auto' }}>
        <Typography
          level="h1"
          sx={{ fontSize: 'xl', position: 'relative', overflow: 'hidden' }}
        >
          <Skeleton loading={loading}>A heading</Skeleton>
        </Typography>
        <Typography
          level="body-xs"
          sx={{ mt: 1, mb: 2, position: 'relative', overflow: 'hidden' }}
        >
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
        )
        : 
       (<Stack spacing={2}>
        {articles.map((article, index) => (
          <Card key={index} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Checkbox
                  checked={selectedArticles.has(index)}
                  onChange={() => toggleArticleSelection(index)}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography level="title-md" sx={{ mb: 1 }}>
                    {article.title}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
                    {article.year && <Chip size="sm" variant="soft">{article.year}</Chip>}
                    {article.publicationType !== 'No definido' && (<Chip size="sm" variant="soft">{article.publicationType}</Chip>)}
                    {article.language !== 'No definido' && (
                      <Chip size="sm" variant="soft" color="neutral">{normalizeLanguage(article.language)}</Chip>
                    )}
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
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>)}
        
      {/* paginas */}
      {articles.length > 0 && (
        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => {setLoading(true);searchArticles(currentPage - 1)}}
          >
            Anterior
          </Button>
          <Typography level="body-md" sx={{ alignSelf: 'center', px: 2 }}>
            Página {currentPage}
          </Typography>
          <Button
            variant="outlined"
            disabled={articles.length < 10}
            onClick={() => {setLoading(true);searchArticles(currentPage + 1)}}
          >
            Siguiente
          </Button>
        </Stack>
      )}

      {/* modal detalles */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog size="lg" sx={{ minWidth: 1200, maxHeight: '90vh', overflow: 'auto' }}>
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
                  {loadDetails? (<Typography><CircularProgress size='sm' />Cargando Información</Typography>
                ):(
                  <Stack>
                    <Typography level="title-sm" sx={{ mb: 1 }}>OpenAccess:</Typography>
                  {oa.msg? (<Typography>{oa.msg}</Typography>):(
                    <Stack>
                      {oa.is_oa===false && <Typography>{oa.oa_url}</Typography> }
                      {oa.is_oa===true &&
                      <Stack spacing={2}>
                      <a href={oa.url}>Mejor link OpenAccess</a>
                      {oa.other_url.map((url, index)=>(
                        <Stack key={index} spacing={1}>
                          <Typography level='body-xs'>Otros links OpenAccess:</Typography>
                          <a href={url.link}>Versión publicada: "{url.version}"</a>
                          <a href={url.pdfLink}>Pdf directo</a>
                        </Stack>
                      ))}</Stack>
                      }
                  </Stack>
                )}
                  </Stack>
                )}
                </Box>
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
      </Modal>
      <InfoToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </Box>
  );
};
export default ProjectArticles