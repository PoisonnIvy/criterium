import Typography from '@mui/joy/Typography';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import  {useAuth}  from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import logo from '../assets/logo.png'
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';

export default function Navbar({onMenuClick}) {
  const {user}=useAuth();
  const navigate= useNavigate();
  const location = useLocation();
  const baseRoutes = ['/', '/login', '/project'];

  const handleBack = () => {

    if (baseRoutes.includes(location.pathname) || window.history.length <= 2) {
      navigate('/project');
    } else {
      navigate(-1);
    }
  };
  return (
    <div className='navbar'>
      {!baseRoutes.includes(location.pathname) && (
      <ArrowBackIosNewTwoToneIcon
        sx={{ color: 'white', cursor: 'pointer', mr: 2 }}
        onClick={handleBack}
      />
    )}
      {user?(
      <>
      <div className='logo' onClick={onMenuClick}>
        <img
          src={logo}
          style={{
          height: '50px',
          cursor: 'pointer'
        }}
        />
      </div>
      <ToastContainer />
      </>):(      
      <img
          src={logo}
          style={{
          height: '50px', 
        }}
        />)}

    </div>
  )
}



