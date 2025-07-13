import CircularProgress from '@mui/joy/CircularProgress';
import Button from '@mui/joy/Button';
import {useProject} from '../../hooks/useProject';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ArticleIcon from '@mui/icons-material/Article';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

const ProjectDetail = () => {
  const { project, assignments, articles, role, instances, baseform } = useProject();
  const navigate = useNavigate();

  if (!project) return <CircularProgress variant='outlined' size='lg'/>;

  
  
  // estadsticas generales de los articulos cribados/no cribados
  const totalArticles = Array.isArray(articles) ? articles.length : 0;
  const pendingArticles = Array.isArray(articles)
    ? articles.filter(a => a.status === 'pendiente').length
    : 0;
  const rejectedArticles = Array.isArray(articles)
    ? articles.filter(a => a.status === 'descartado').length
    : 0;
  const acceptedArticles = Array.isArray(articles)
    ? articles.filter(a => a.status === 'aceptado').length
    : 0;

  ///
  //instancias
  const instancesinProgress = Array.isArray(instances)
    ? instances.filter(a => a.analysisStatus === 'en curso').length
    : 0;
    const instancesNotStarted = Array.isArray(instances)
    ? instances.filter(a => a.analysisStatus === 'pendiente').length
    : 0;
    const instancesCompleted = Array.isArray(instances)
    ? instances.filter(a => a.analysisStatus === 'completado' || a.completitionPercentage === 100).length
    : 0;


    
  // asignaciones
  const totalAssignments = Array.isArray(assignments)? assignments.length : 0;
  const droppedAssignments = Array.isArray(assignments)
    ? assignments.filter(a => a.status === 'no asignado' && a.reviewerId === null).length
    : 0; 
  const notAssigned = totalAssignments - totalArticles;
  

  const hasFormularioBase = baseform.msg? false: true;

  return (
    <Box component="main" sx={{ p: 1, maxWidth: 900, mx: '50px' }}>
      {role==='investigador principal' && !hasFormularioBase && (
        <Card variant="soft" color="warning" sx={{ mb: 2, p: 2, bgcolor: '#fffbe6', border: '1px solid #ffe58f' }}>
          <Typography level="h4" color="warning" sx={{ mb: 1 }}>
            ¡Debes crear el formulario base para tu proyecto!
          </Typography>
          <Typography level="body-md" sx={{ mb: 2 }}>
            El formulario base es necesario para continuar con la gestión del proyecto.
          </Typography>
          <Button color="warning" variant="solid" onClick={() => navigate(`/project/${project._id}/baseform`)}>
            Ir a crear formulario base
          </Button>
        </Card>
      )}
      <Card variant='outlined' sx={{ mb: 3, p: 3, bgcolor:'#f3f3ee'}}>
        <Typography level="h2" sx={{ mb: 1, display: 'flex', fontFamily: 'Josefin Sans', alignItems: 'center', gap: 1 }}>
          <GroupIcon color="primary" /> {project.name}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Chip color={project.status === 'activo' ? 'success' : 'neutral'} variant="soft">
            {project.status}
          </Chip>
          <Chip variant="outlined" startDecorator={<CalendarMonthIcon />}>
            Creado el {new Date(project.createdAt).toLocaleDateString()}
          </Chip>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography level="body-md" sx={{ mb: 1 }}>
          {project.description}
        </Typography>
        {/* Estado general del proyecto */}
        <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: '#f8f8f8', borderRadius: 2 }}>
          <h2 style={{marginBottom:'20px',  fontFamily: 'Josefin Sans'}}>Estado general del proyecto</h2>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Stack direction='column' spacing={1.5}>
              <Typography level='title-lg' sx={{fontFamily: 'Josefin Sans'}} >Artículos</Typography>
            <Chip variant="soft" color="primary" startDecorator={<ArticleIcon />}>
              Artículos totales: {totalArticles}
            </Chip>
            <Chip variant="soft" color="warning" startDecorator={<HourglassEmptyIcon />}>
              Sin cribar: {pendingArticles}
            </Chip>
            <Chip variant="soft" color="success" startDecorator={<CheckCircleIcon />}>
              Marcados como aceptado: {acceptedArticles}
            </Chip>
            <Chip variant="soft" color="danger" startDecorator={<ErrorOutlineIcon />}>
              Marcados como rechazados: {rejectedArticles}
            </Chip>
            </Stack>
          <Stack direction='column' spacing={1.5}>
            <Typography level='title-lg'sx={{fontFamily: 'Josefin Sans'}} >Asignaciones</Typography>
            <Chip variant="soft" color="primary" startDecorator={<AssignmentIndIcon />}>
              Asignados: {totalAssignments}
            </Chip>
             <Chip variant="soft" color="warning" startDecorator={<AssignmentIndIcon />}>
              Sin asignar: {notAssigned}
            </Chip>
            <Chip variant="soft" color="danger" startDecorator={<ErrorOutlineIcon />}>
              Abandonados/Revocados: {droppedAssignments}
            </Chip>
            </Stack>

            <Stack direction='column' spacing={1.5}>
            <Typography level='title-lg' sx={{fontFamily: 'Josefin Sans'}} >Análisis</Typography>
            <Chip variant="soft" color="warning" startDecorator={<HourglassEmptyIcon />}>
              Analisis no comenzados: {instancesNotStarted}
            </Chip>
            <Chip variant="soft" color='neutral' startDecorator={<AssignmentIndIcon />}>
              Analisis en progreso: {instancesinProgress}
            </Chip>
            <Chip variant="soft" color="success" startDecorator={<CheckCircleIcon />}>
              Analisis completados: {instancesCompleted}
            </Chip>
            </Stack>
          </Stack>
        </Box>
      </Card>

      <Typography level="h3" sx={{ mb: 2 }}>Miembros del proyecto</Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {project.members.map(member => (
          <Card key={member.userId._id || member.userId} variant="soft" sx={{ minWidth: 220, mb: 2, bgcolor:'#c59d9d'}}>
            <CardContent>
              <Stack spacing={1}>
                <Typography level="title-md" startDecorator={<PersonIcon />}>
                  {member.userId.name}
                </Typography>
                <Chip color="primary" variant="soft" sx={{ width: 'fit-content' }}>
                  {member.role}
                </Chip>
                <Typography level='body-sm' color='black' startDecorator={<EmailIcon />}>
                  {member.userId.email}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default ProjectDetail;