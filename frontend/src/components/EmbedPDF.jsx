import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Button from '@mui/joy/Button'

export default function EmbedPDF({  abstract, pdfPath, links }) {
  if (pdfPath) {
    return (
      <Box sx={{ minWidth: "100%", height: '100%', borderRadius: 3, boxShadow: 2, bgcolor: 'white', p: 2 }}>
        <iframe
          src={pdfPath}
          title='PDF'
          width='100%'
          height='700px'
          style={{ border: 'none', borderRadius: 8 }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: "100%", height: '100%', borderRadius: 3, boxShadow: 2, bgcolor: 'white', p: 2 }}>
      <Typography level="h4" sx={{ mb: 2, color: 'var(--color-terracotta)' }}>Resumen del artículo</Typography>
      <Typography level="body-md" sx={{ mb: 2 }}>{abstract || 'No hay resumen disponible.'}</Typography>
      {Array.isArray(links) && links.length > 0 && (
        <Box sx={{ mt: 2, overflow: 'auto' }} >
          <Typography level="body-md" sx={{ mb: 1, fontWeight: 'bold' }}>Enlaces disponibles:</Typography>
          <ul style={{ paddingLeft: 20 }}>
            {links.map((l, idx) => (
              <li key={idx}>
                <Button
                  component="a"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="soft"
                  color="primary"
                  sx={{ mb: 1 }}
                >
                  {l.label || l.url}
                </Button>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
}

