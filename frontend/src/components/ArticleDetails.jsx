import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import Button from '@mui/joy/Button';

export default function ArticleDetailsModal({ open, onClose, article }) {
  if (!article) return null;

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


  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" sx={{ maxWidth: 1000, maxHeight: '90vh', overflow: 'auto' }}>
        <ModalClose />
        <Box>
          <Typography level="h3" sx={{ mb: 2 }}>
            {article.title}
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {article.year && <Chip variant="soft">{article.year}</Chip>}
              {article.journal && (
                <Chip variant="soft" color="primary">{article.journal}</Chip>
              )}
              {article.publisher && (
                <Chip variant="soft" color="neutral">{article.publisher}</Chip>
              )}
            </Stack>
            <Divider />
            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>Autores:</Typography>
              <Typography level="body-md">
                {article.authors?.map(author => author.name).join(', ')}
              </Typography>
            </Box>
            {article.abstract && (
              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>Abstract:</Typography>
                <Typography level="body-md">
                  {cleanAbstract ? cleanAbstract(article.abstract) : article.abstract}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>Información de publicación:</Typography>
              <Stack spacing={1}>
                {article.publicationType && (
                  <Typography level="body-sm">Tipo de publicación: {article.publicationType}</Typography>
                )}
                {article.doi && (
                  <Typography level="body-sm">DOI: {article.doi}</Typography>
                )}
                {article.language && (
                  <Typography level="body-sm">Idioma: {normalizeLanguage ? normalizeLanguage(article.language) : article.language}</Typography>
                )}
                {article.pages && (
                  <Typography level="body-sm">Páginas: {article.pages}</Typography>
                )}
                {article.volume && (
                  <Typography level="body-sm">Volúmen: {article.volume}</Typography>
                )}
                {article.issue && (
                  <Typography level="body-sm">Número: {article.issue}</Typography>
                )}
              </Stack>
            </Box>
            <Box>
              <Typography level="title-sm" sx={{ mb: 1 }}>Métricas:</Typography>
              <Stack direction="row" spacing={2}>
                {article.citationCount && (
                  <Chip variant="soft" color="success">
                    {article.citationCount} citas
                  </Chip>
                )}
                {article.referenceCount && (
                  <Chip variant="soft" color="warning">
                    {article.referenceCount} referencias
                  </Chip>
                )}
              </Stack>
            </Box>
            {article.doiUrl && (
              <Button
                component="a"
                color='primary'
                href={article.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2 }}
              >
                Ver artículo completo
              </Button>
            )}
          </Stack>
        </Box>
      </ModalDialog>
    </Modal>
  );
}