/* eslint-disable react-hooks/exhaustive-deps */
import ProjectSubMenu from "./ProjectSubmenu";
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useProject } from '../hooks/useProject'; //
import Box from '@mui/joy/Box';
import { useAuth } from "../hooks/useAuth";

function ProjectLayout() {
  const {user, setUser} = useAuth();
  const { projectId } = useParams();
  const { fetchProject, fetchArticles,
          fetchBaseform, fetchAssignments, 
          project, fetchInstances} = useProject();
  const navigate = useNavigate();
  useEffect(() => {
  if(!user) {setUser(null);navigate('/login')}
    fetchProject(projectId);
    fetchBaseform(projectId);
    fetchAssignments(projectId);
    fetchArticles(projectId);
    fetchInstances(projectId);
  }, [user,projectId, fetchProject, fetchArticles, fetchBaseform, fetchAssignments, project]);
  
  return (
    <Box>
      <ProjectSubMenu />
      <Box component="main" sx={{ width:'100%',paddingLeft: 1, paddingRight:1, paddingTop:2, overflow:'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
export default ProjectLayout