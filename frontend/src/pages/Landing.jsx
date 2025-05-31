import React from 'react'
import { Link } from 'react-router-dom';

const Landing = () => {
  //const navigate = useNavigate()
  return (
    <>
    <div>henlo</div>
            <embed
          src="https://cataas.com/cat"
          width="600"
          height="400"
          type="image/jpg"
          ></embed>
    <Link to="/login">
      <button>Login</button>
    </Link>
    <Link to="/signup">
      <button>Sign Up</button>
    </Link>
    
    
    </>
  )
}

export default Landing