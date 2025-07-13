import { useLocation, Link, useParams } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TaskIcon from '@mui/icons-material/Task';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SearchIcon from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

function ProjectSubMenu() {
  const { projectId } = useParams(); 
  const location = useLocation(); 

  const projectTabs = [
    { label: 'Detalles del proyecto', path: `/project/${projectId}`, icon: <DashboardIcon /> },
    { label: 'Buscar artículos', path: `/project/${projectId}/articles`, icon: <SearchIcon /> },
    { label: 'Cargar archivos', path: `/project/${projectId}/upload`, icon: <FileUploadIcon   /> },
    { label: 'Biblioteca', path: `/project/${projectId}/biblioteca`, icon: <LocalLibraryIcon /> },
    { label: 'Screening', path: `/project/${projectId}/screening`, icon: <CheckBoxIcon /> },
    { label: 'Formulario Base', path: `/project/${projectId}/baseform`, icon: <ListAltIcon /> },
    { label: 'Asignaciones', path: `/project/${projectId}/instances`, icon: <TaskIcon /> },
    { label: 'Gráficos', path: `/project/${projectId}/graficos`, icon: <AnalyticsIcon /> },
    { label: 'Configuración', path: `/project/${projectId}/config`, icon: <SettingsIcon /> },
  ];

 const activeTabIndex = projectTabs.findIndex((tab, idx) => {
    if (idx === 0) {
      return location.pathname === tab.path;
    }
    return location.pathname.startsWith(tab.path);
  });
  return (
    <Box sx={{ bgcolor: 'background.surface', borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        aria-label="Project Navigation"
        value={activeTabIndex === -1 ? false : activeTabIndex} 
        sx={{ '--Tabs-gap': '1px', }}
      >
        <TabList variant="plain" disableUnderline>
          {projectTabs.map((tab, index) => (
            <Tab
              key={index}
              component={Link}
              to={tab.path}
              sx={{maxWidth:'170px'}}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {tab.icon}
                {tab.label}
              </Box>
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </Box>
  );
}

export default ProjectSubMenu