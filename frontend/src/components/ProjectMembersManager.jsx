import React, { useState } from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import IconButton from '@mui/joy/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Typography from '@mui/joy/Typography';
import validator from 'validator'
import axios from 'axios';
import CircularProgress from '@mui/joy/CircularProgress';
import InfoToast from './InfoToast';
import { useAuth } from '../hooks/useAuth';

const ProjectMembersManager = ({
  members,
  role,
  projectId,
  refreshMembers
}) => {
  const {user} = useAuth();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addStatus, setAddStatus] = useState(null);
  const [addMessage, setAddMessage] = useState('');
  const [changingRoleId, setChangingRoleId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [removeStatus, setRemoveStatus] = useState(null);
  const [removeMessage, setRemoveMessage] = useState('');
  const [removingLoading, setRemovingLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const handleAdd = async () => {
    setAddLoading(true);
    setAddStatus(null);
    setAddMessage('');
    if (!validator.isEmail(newMemberEmail)) {
    setAddStatus('error');
    setAddMessage('El correo ingresado no tiene un formato válido.');
    return;
  }
    const alreadyMember = members.some(
      m => (m.userId.email) === newMemberEmail
    );
    if (alreadyMember) {
      setAddStatus('error');
      setAddMessage('El usuario ya es miembro del proyecto.');
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/invite/${projectId}`,
        { email: newMemberEmail },
        { withCredentials: true }
      );
      setAddStatus('success');
      setAddMessage('Invitación enviada correctamente.');
      if (refreshMembers) refreshMembers();
    } catch (error) {
      console.log(error)
      setAddStatus('error');
      setAddMessage(
        error?.response?.data?.message || 'Error al enviar la invitación.'
      );
    } finally{
      setTimeout(() => {
        setAddLoading(false);
        setNewMemberEmail('');
        setAddStatus(null);
        setAddMessage('');
      }, 2500);
    }
  };

  const handleRemove = async (member) => {
    setRemovingLoading(true);
    setRemoveStatus(null);
    setRemoveMessage('');
    if (member.role === 'investigador principal') {
      setRemoveStatus('error');
      setRemoveMessage('No puedes eliminar al investigador principal del proyecto.');
      return;
    }
    try {
      await axios.patch(
        `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/member/${projectId}/${member.userId._id}`,
        {},
        { withCredentials: true }
      );
      setRemoveStatus('success');
      setRemoveMessage('Miembro eliminado correctamente.');
      
      if (refreshMembers) refreshMembers();
    } catch (error) {
      setRemoveStatus('error');
      setRemoveMessage(
        error?.response?.data?.message || 'Error al eliminar el miembro.'
      );
    } finally{
      setTimeout(() => {
        setRemovingLoading(false);
        setRemoveStatus(null);
        setRemoveMessage('');
      }, 2500);
    }
  };

  const handleChangeRole = async (member, newRole) => {
  if (member.role === 'investigador principal') return; 
  if(!['editor','colaborador'].includes(newRole)) return;
  try {
    await axios.patch(
      `${import.meta.env.VITE_APP_SERVER_URL}/proyecto/member/${projectId}/${member.userId._id}/role`,
      { member: { userId: member.userId._id, role: newRole } },
      { withCredentials: true }
    );
    setChangingRoleId(null);
    setNewRole('');
    if (refreshMembers) refreshMembers();
  } catch (error) {
    console.log(error)
  }
};

  return (
    <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 4, bgcolor: '#fafafa' }}>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Input
          placeholder="Correo del nuevo miembro"
          type='email'
          value={newMemberEmail}
          onKeyDown={e => {
                if (e.key === 'Enter') handleAdd();
            }}
          disabled={addLoading}
          onChange={e => {
            setNewMemberEmail(e.target.value);
            setAddStatus(null);
            setAddMessage('');
          }}
          size="sm"
          sx={{ flex: 1 }}
        />
        <IconButton color="primary" onClick={handleAdd} disabled={addLoading}>
          {addLoading ? (
            <CircularProgress />
          ) : (
            <PersonAddIcon />
          )}
        </IconButton>
      </Stack>
      {addStatus && (
        <Typography color={addStatus === 'success' ? 'success' : 'danger'} level="body-sm" sx={{ mb: 1 }}>
          {addMessage}
        </Typography>
      )}




      <Stack spacing={1}>
        {members.map(member => (
          <Box key={member.userId._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderBottom: '1px solid #eee' }}>
            <Box sx={{ flex: 1 }}>
              <b>{member.userId.name}</b> <span style={{ color: '#888' }}>({member.role})</span>
              <div style={{ fontSize: 12, color: '#888' }}>{member.userId.email}</div>
            </Box>
            {(['investigador principal', 'editor'].includes(role)) && (
              <IconButton
                color="danger"
                onClick={() => {
                  setMemberToRemove(member);
                  setShowConfirmRemove(true);
                }}
                disabled={member.role === 'investigador principal' || member.userId._id === user.userId}
                title={member.role === 'investigador principal' ? 'No puedes eliminar al investigador principal' : 'Eliminar miembro'}
              >
                {removingLoading ? (
                  <CircularProgress />
                ) : (
                  <>Eliminar miembro<DeleteIcon /></>
                )}
              </IconButton>
            )}
            {role === 'investigador principal' && (
              changingRoleId === (member.userId._id || member.userId) ? (
                <>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                    <option value="">Selecciona un rol</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="editor">Editor</option>
                  </select>
                  <Button size="sm" onClick={()=> handleChangeRole(member, newRole)}>Guardar</Button>
                  <Button size="sm" color="neutral" onClick={() => setChangingRoleId(null)}>Cancelar</Button>
                </>
              ) : (
                <IconButton color="primary" 
                            onClick={() => setChangingRoleId(member.userId._id || member.userId)}
                            disabled={member.role === 'investigador principal'}>
                  <EditIcon />
                </IconButton>
              )
            )}
          </Box>
        ))}
      </Stack>
      {removeStatus && (
        <Typography color={removeStatus === 'success' ? 'success' : 'danger'} level="body-sm" sx={{ mt: 1 }}>
          {removeMessage}
        </Typography>
      )}
      <InfoToast
        open={showConfirmRemove}
        message={`¿Estás seguro que deseas eliminar a ${memberToRemove?.userId?.name || ''}?`}
        type="warning"
        showConfirm
        showCancel
        onConfirm={async () => {
          setShowConfirmRemove(false);
          if (memberToRemove) await handleRemove(memberToRemove);
          setMemberToRemove(null);
        }}
        onCancel={() => {
          setShowConfirmRemove(false);
          setMemberToRemove(null);
        }}
        onClose={() => {
          setShowConfirmRemove(false);
          setMemberToRemove(null);
        }}
      />
    </Box>
  );
};

export default ProjectMembersManager;