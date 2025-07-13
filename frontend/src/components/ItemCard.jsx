import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import CardOverflow from '@mui/joy/CardOverflow';
import Divider from '@mui/joy/Divider';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';

export default function ItemCard({proj, userRole}) {
    const navigate = useNavigate();
    const {setProject} = useProject();
  return (
   <Card variant="outlined" 
         sx={{ cursor: 'pointer', width:'300px', height: '200px'}}
         onClick={()=>{setProject(null);navigate(`/project/${proj._id}`)}}
         >
      <CardContent sx={{contentVisibility:'auto'}}>
        <Typography level='h3' sx={{overflowWrap: 'break-word'}}>
          {proj.name.length > 30? proj.name.substring(0, 30)+ '...' : proj.name}
        </Typography>

        <Typography level='body-sm' sx={{overflowWrap: 'break-word'}}>
          {proj.description.length > 100 ? proj.description.substring(0, 100) + '...'
    : proj.description}</Typography>
      </CardContent>
      <CardOverflow variant="soft" sx={{ bgcolor: '#c59d9d'}}>
        <Divider inset="context" />
        <CardContent orientation="horizontal" sx={{ display:'flex ', justifyContent:'space-between'}}>
        <Typography level="body-xs"
                    textColor="black"
                    sx={{ fontWeight: 'md' }}>
          {userRole.charAt(0).toUpperCase()+ userRole.slice(1)}  
        </Typography>
        <Typography level="body-xs"
                    textColor="black"
                    sx={{ fontWeight: 'md' }}>
          | 
        </Typography>

        <Typography level="body-xs"
                    textColor="black"
                    sx={{ fontWeight: 'md' }}>{proj.status.charAt(0).toUpperCase()+ proj.status.slice(1)}</Typography>
      </CardContent>
      </CardOverflow>
    </Card>
  )
}

