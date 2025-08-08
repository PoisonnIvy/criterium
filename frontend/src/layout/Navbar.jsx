import Typography from '@mui/joy/Typography';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import  {useAuth}  from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import logo from '../assets/logo.png'
import { useState, useRef, useEffect } from 'react';
import ArrowBackIosNewTwoToneIcon from '@mui/icons-material/ArrowBackIosNewTwoTone';
import Avatar from '@mui/joy/Avatar';
import Stack from '@mui/joy/Stack';

export default function Navbar({onMenuClick}) {
  const {user, logout}=useAuth();
  const [showName, setShowName] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);
  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(event) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  const navigate= useNavigate();
  const location = useLocation();
  const baseRoutes = ['/', '/login', '/project', '/signup'];

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
      {user ? (
        <>
          <Stack direction='row' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className='logo' onClick={onMenuClick} style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={logo}
                style={{ height: '50px', cursor: 'pointer' }}
                alt='Logo'
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                minWidth: 50
              }}
              onMouseEnter={() => setShowName(true)}
              onMouseLeave={() => setShowName(false)}
            >
              <Avatar
                ref={avatarRef}
                size="lg"
                sx={{
                  bgcolor: 'var(--color-terracotta)',
                  color: 'white',
                  boxShadow: '0 2px 20px rgba(0, 0, 0, 0.33)',
                  fontWeight: 700,
                  fontSize: 32,
                  width: 50,
                  height: 50,
                  mb: 1,
                  mt: 1,
                  zIndex: 2,
                  cursor: 'pointer'
                }}
                onClick={() => setShowMenu((prev) => !prev)}
              >
                {user?.name?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <span
                style={{
                  position: 'absolute',
                  right: 60,
                  top: '50%',
                  transform: showName ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(30px)',
                  opacity: showName ? 1 : 0,
                  color: 'white',
                  borderRadius: 8,
                  padding: '6px 16px',
                  fontWeight: 400,
                  fontSize: 18,
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.3s, transform 0.3s',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                Hola, {user?.name}
              </span>
              {showMenu && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    top: 70,
                    right: 0,
                    background: 'var (--color-sage)',
                    color: 'white',
                    borderRadius: 4,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                    padding: '8px 0',
                    minWidth: 120,
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'fadeInDown 0.2s'
                  }}
                >
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'black',
                      fontWeight: 200,
                      fontSize: 12,
                      padding: '8px 16px',
                      cursor: 'pointer',
                      borderRadius: 6,
                      width: '100%',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => { setShowMenu(false); logout(); }}
                    onMouseDown={e => e.preventDefault()}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </Stack>
          <ToastContainer />
        </>
      ) : (
        <img
          src={logo}
          style={{ height: '50px' }}
          alt='Logo'
        />
      )}
    </div>
  )
}



