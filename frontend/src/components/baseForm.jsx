import { useState } from 'react';
import Modal from '@mui/joy/Modal';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Switch from '@mui/joy/Switch'
import { useEffect } from 'react';

const FIELD_TYPES = [
  { value: 'textarea', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'select', label: 'Selector' },
  { value: 'multiselect', label: 'Selector múltiple' },
  { value: 'boolean', label: 'Sí/No' },
  { value: 'date', label: 'Fecha' },
];


export default function BaseFormModal({ open,
  onClose,
  onCreate,
  onEdit,
  editMode = false,
  initialFields = [],
  timeLeft = null}) {

  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    type: '',
    label: '',
    helpText: '',
    options: '',
  });
  
  useEffect(() => {
    if (open) {
      setFields(editMode ? initialFields : []);
    }
  }, [open, editMode, initialFields]);



  const formatTime = (seconds) => {
        if (seconds <= 0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

  const handleAddField = () => {
    const fieldToAdd = {
      ...newField,
      enabled:true,
      options: (newField.type === 'select' || newField.type === 'multiselect')
        ? newField.options.split(',').map(opt => opt.trim())
        : undefined,
    };
    setFields([...fields, fieldToAdd]);
    setNewField({ type: '', label: '', helpText: '', options: '' });
  };

  const handleFieldChange = (idx, prop, value) => {
    setFields(fields =>
      fields.map((f, i) =>
        i === idx
          ? {
              ...f,
              [prop]:
                prop === 'options'
                  ? value.split(',').map(opt => opt.trim())
                  : value,
            }
          : f
      )
    );
  };

  const handleToggleEnabled = (idx) => {
    setFields(fields =>
      fields.map((f, i) =>
        i === idx ? { ...f, enabled: !f.enabled } : f
      )
    );
  };

const isValidFields = fields.every(f => f.label && f.label.trim().length > 0);

  const handleSubmit = () => {
    if (!isValidFields) {
    alert("Todos los campos deben tener nombre.");
    return;
  }
    if (editMode && onEdit) {
      onEdit(fields);
    } else {
      onCreate(fields);
    }
    setFields([])
  };

  return (
    <Modal open={open} onClose={(reason) => {
    if (reason !== 'backdropClick') {
      onClose
    }
  }}>
      <Box sx={{ bgcolor: 'background.body', p: 4, borderRadius: 2, minWidth: 400, mx: 'auto', mt: 10, maxWidth:1200, maxHeight: '80vh', overflowY: 'auto'}}>
        {editMode &&
        <Typography level='body-sm'>Tienes <span>{formatTime(timeLeft)}</span> minutos para editar este formulario
          </Typography>}

        <Typography level="h4" mb={2}>{editMode ? 'Editar Formulario Base' : 'Crear Formulario Base'}</Typography>
        <Stack spacing={2}>
          <Select
            placeholder="Tipo de campo"
            requiered={true}
            value={newField.type}
            onChange={(_, value) => setNewField(f => ({ ...f, type: value }))}
          >
            {FIELD_TYPES.map(ft => (
              <Option key={ft.value} value={ft.value}>{ft.label}</Option>
            ))}
          </Select>
          <Input
            placeholder="Nombre del campo"
            value={newField.label}
            required={true}
            onChange={e => setNewField(f => ({ ...f, label: e.target.value }))}
          />
          <Input
            placeholder="Texto de ayuda (opcional)"
            value={newField.helpText}
            onChange={e => setNewField(f => ({ ...f, helpText: e.target.value }))}
          />
          {(newField.type === 'select' || newField.type === 'multiselect') && (
            <Textarea
              placeholder="Opciones (separadas por coma)"
              value={newField.options}
              onChange={e => setNewField(f => ({ ...f, options: e.target.value }))}
              minRows={2}
            />
          )}
          <Button onClick={handleAddField} disabled={!newField.type || !newField.label}>
            Agregar campo
          </Button>
        </Stack>
        <Box mt={3}>
          <Typography level="body-md">Campos {editMode ? 'existentes' : 'agregados'}:</Typography>
          <ul>
            {fields.map((f, i) => (
              <li key={i} style={{ marginBottom: 16 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Input
                    value={f.label}
                    onChange={e => handleFieldChange(i, 'label', e.target.value)}
                    placeholder="Nombre del campo"
                    disabled={!editMode}
                  />
                  <Input
                    value={f.helpText || ''}
                    onChange={e => handleFieldChange(i, 'helpText', e.target.value)}
                    placeholder="Texto de ayuda"
                    disabled={!editMode}
                  />
                  {(f.type === 'select' || f.type === 'multiselect') && (
                    <Textarea
                      value={f.options ? f.options.join(', ') : ''}
                      onChange={e => handleFieldChange(i, 'options', e.target.value)}
                      placeholder="Opciones (separadas por coma)"
                      minRows={1}
                      disabled={!editMode}
                    />
                  )}
                  {editMode && (
                    <Switch
                      checked={f.enabled !== false}
                      onChange={() => handleToggleEnabled(i)}
                      color={f.enabled !== false ? 'success' : 'danger'}
                      endDecorator={f.enabled !== false ? 'Habilitado' : 'Deshabilitado'}
                    />
                  )}
                  {!editMode && (
                    <Button sx={{ ml: 2 }} size='sm' onClick={() => setFields(fields.filter((_, idx) => idx !== i))}>Quitar</Button>
                  )}
                </Stack>
              </li>
            ))}
          </ul>
        </Box>
        <Stack direction="row" spacing={2} mt={2}>
          <Button variant="soft" color="neutral" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={fields.length === 0|| !isValidFields}>
            {editMode ? 'Actualizar formulario' : 'Crear formulario'}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
