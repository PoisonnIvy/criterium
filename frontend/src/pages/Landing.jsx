import Button from '@mui/joy/Button'
import { Link } from 'react-router-dom';

const Landing = () => {
  //const navigate = useNavigate()
  return (
    <>
    <div>henlo</div>

    <Link to="/login">
      <Button variant='solid'>Login</Button>
    </Link>

    <Link to="/signup">
      <Button variant='soft'>Sign Up</Button>
    </Link>
    
    </>
  )
}

export default Landing