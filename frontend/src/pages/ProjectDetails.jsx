import { useEffect,useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/joy/CircularProgress';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project,setProject] = useState(null);
  const navigate = useNavigate();
  
  useEffect(()=>{

    const fetchProject = async () =>{

      try {
        const res= await axios.get(
          `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/${id}`,
          {withCredentials:true}
        );
        setProject(res.data);
      } catch (error) {
        console.error(error)
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <CircularProgress variant='outlined' size='lg'/>;

  return (
    <>
    <div>
      <h2>Detalle del Proyecto</h2>
      <p>ID del proyecto: {project._id}</p>
      <p>Descripción: {project.description}</p>
      <div>
          Miembros del proyecto:
          {project.members.map(member => (
            <div key={member.userId}>
              <div>{member.userId.name}</div>
              <div>{member.role}</div>
              <div>{member.userId.email}</div>
            </div>
          ))}
      </div>
      <p>Estado:{project.status}</p>
      <p>Fecha de creación:{new Date(project.createdAt).toLocaleString()}</p>
    </div>
    <button onClick={()=> navigate(-1)}>Volver</button>
    </>
  );
};

export default ProjectDetail;