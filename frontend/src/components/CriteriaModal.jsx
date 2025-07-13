/* eslint-disable react-hooks/exhaustive-deps */
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import IconButton from '@mui/joy/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Textarea from '@mui/joy/Textarea';
import { useState } from 'react';
import { useEffect } from 'react';


export default function CriteriaModal({ open, onClose, title, description, criteria, onSave }) {
  const [localCriteria, setLocalCriteria] = useState(criteria || []);
  const [newCriterion, setNewCriterion] = useState('');
useEffect(() => {
   if (open) {
    setLocalCriteria(criteria || []);
    setNewCriterion('');
  }
  }, [open]);

  const handleAddCriterion = () => {
    if (newCriterion.trim().length === 0) return;
    setLocalCriteria([...localCriteria,newCriterion.trim()]);
    setNewCriterion('');
  };

  const handleRemoveCriterion = idx => {
    setLocalCriteria(localCriteria.filter((_, i) => i !== idx));
  };

  const handleSave = e => {
    e.preventDefault();
    onSave(localCriteria);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ overflow: 'auto', maxHeight: '90vh' }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{description}</DialogContent>
        <form onSubmit={handleSave}>
          <Stack spacing={2}>
            <FormControl>
              <FormLabel htmlFor="new-criterion-input">Agregar nuevo criterio</FormLabel>
              <Stack direction="row" spacing={1}>
                <Textarea
                  id="new-criterion-input"
                  value={newCriterion}
                  onChange={e => setNewCriterion(e.target.value)}
                  placeholder="Escribe el criterio"
                  size='md'
                />
                <Button type="button" onClick={handleAddCriterion} disabled={!newCriterion.trim()}>
                  Añadir
                </Button>
              </Stack>
            </FormControl>
            <FormLabel sx={{ mt: 2 }}>Criterios actuales</FormLabel>
            <Stack spacing={1}>
              {localCriteria.length === 0 && (
                <FormLabel sx={{ color: 'text.secondary' }}>No hay criterios añadidos.</FormLabel>
              )}
              {localCriteria.map((c, idx) => (
                <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                  <Input
                    value={c}
                    onChange={e => {
                      const updated = [...localCriteria];
                      updated[idx] = e.target.value;
                      setLocalCriteria(updated);
                    }}
                    size="sm"
                    sx={{ flex: 1 }}
                  />
                  <IconButton color="danger" onClick={() => handleRemoveCriterion(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button type="submit" color="success">Guardar cambios</Button>
              <Button type="button" color="neutral" onClick={onClose}>Cancelar</Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}