import { useState } from 'react';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import { useEffect } from 'react';


export const AssignArticleModal = ({ open, onClose, members, onAssign, loading }) => {
  const [selectedMember, setSelectedMember] = useState('');
    useEffect(() => {
    if (open) setSelectedMember('');
  }, [open]);

  const handleAssign = () => {
    if (selectedMember !== '') {
      onAssign(selectedMember);
    }
    setSelectedMember('');
    console.log(selectedMember)
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose />
        <Typography level="h4" mb={2}>Asignar artículo a:</Typography>
        <FormControl>
          <RadioGroup
            value={selectedMember}
            onChange={e => setSelectedMember(e.target.value)}
          >
            {members.map(member => (
              <Radio
                key={member.userId._id}
                value={member.userId._id.toString()}
                label={member.userId.name}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <Stack direction="row" spacing={2} mt={2}>
          <Button variant="soft" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!selectedMember || loading}>
            Asignar
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
};