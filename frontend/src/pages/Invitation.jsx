/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import  CircularProgress  from '@mui/joy/CircularProgress';

const Invitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();


  const acceptInvite = async (inviteToken) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/accept/${inviteToken}`,
        {},
        { withCredentials: true }
      );
      if (data && data.projectId) {
        navigate(`/project/${data.projectId}`);
      } else {
        navigate('/project');
      }
    } catch (error) {
      navigate('/project');
      console.log(error)
    }
  };

  useEffect(() => {
    if (loading) return;

    if (user) {
      acceptInvite(token);
    } else {
      localStorage.setItem('pendingInviteToken', token);
      navigate('/login');
    }
  }, [user, loading, token, navigate]);

 if (loading) return <CircularProgress />;
 
  return (
    <h2>
      Procesando invitación...
    </h2>
  );
};

export default Invitation;