/* eslint-disable react-hooks/exhaustive-deps */

import { useState, createContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components
export const ProjectContext= createContext(null);

export const ProjectProvider = ({children}) => {
  const {user}=useAuth();
  const navigate = useNavigate();
  const [project, setProject]=useState(null);
  const [role, setRole]=useState(null);
  const [articles, setArticles] =useState([]);
  const [baseform, setBaseform] = useState({});
  const [instances, setInstances] = useState({});
  const [assignments, setAssignments] = useState({});

   const fetchProject = useCallback(async(projectId) =>{
      try {
        const res= await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/${projectId}`,
          {withCredentials:true}
        );
        for(const member of res.data.members){
          if(user.userId===member.userId._id){
            setRole(member.role)
            break;
          }
        }
        setProject(res.data);
      } catch (error) {
        setProject({msg:'No se ha encontrado el proyecto'})
        navigate('/project')
        console.error(error)
      }
    }, [user]);
  
  const fetchArticles= useCallback (async(projectId) =>{
    try {
      const res = await axios.get( `${import.meta.env.VITE_APP_SERVER_URL}/articulos/project/${projectId}/all/articles`,
          { withCredentials: true });
        if(res.data.length ===0 || !res.data) {
          setArticles({msg: 'No se han encontrado artículos asociados al proyecto'})
        } else setArticles(res.data);

    } catch (error) {
      setArticles({msg:'Ha ocurrido un error inesperado, intenta nuevamente'})
      console.log(error)
    }
  },[]);

  const fetchBaseform = useCallback (async(projectId)=> {
    try {
      const res= await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/get`,
          {withCredentials: true}
        )
        if(res.data === null) {
          setBaseform({msg:'El proyecto aun no tiene formulario guía'})
        }else setBaseform(res.data)
    } catch (error) {
      setBaseform({msg:'Ha ocurrido un error inesperado, intenta nuevamente'})
      console.log(error)
    }
    
  },[])

 
    const fetchInstances = useCallback (async(projectId)=> {
    try {
      const res= await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}/instancia/project/${projectId}/instances`,
          {withCredentials: true}
        )
        setInstances(res.data)
    } catch (error) {
      setBaseform({msg:'Ha ocurrido un error inesperado, intenta nuevamente'})
      console.log(error)
    }
    
  },[])

    const fetchAssignments = useCallback (async (projectId) =>{
      try {
        const res = await axios.get(`${import.meta.env.VITE_APP_SERVER_URL}/asignacion/project/${projectId}/assignment/all`,
          {withCredentials: true})
          setAssignments(res.data)
      } catch (error) {
        setAssignments({msg:'Ha ocurrido un error inesperado, intenta nuevamente'})
        console.log(error)
      }
    },[])

 const postBaseForm = useCallback (async (projectId, fields) =>{
    if(role !== 'investigador principal') return;
      try {
        const res = await axios.post(`${import.meta.env.VITE_APP_SERVER_URL}/formulario/project/${projectId}/bform/create`,
          {fields},
          {withCredentials: true})
          setBaseform(res.data)
      } catch (error) {
        setBaseform({msg:'Ha ocurrido un error inesperado al crear el formulario, intenta nuevamente'})
        console.log(error)
      }
    },[role])


    const value = {
      fetchArticles,
      fetchProject,
      fetchBaseform,
      fetchInstances,
      fetchAssignments,
      postBaseForm,
      setProject,
      project,
      articles,
      baseform,
      instances,
      assignments,
      role
    }

  return (
    <ProjectContext.Provider value={value}>
          {children}
    </ProjectContext.Provider>
  )
}
