/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react'
import InfoToast from './InfoToast';
import  Skeleton  from '@mui/joy/Skeleton'
import axios from 'axios'
import { useProject } from '../hooks/useProject'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import Stack from '@mui/joy/Stack'
import Input from '@mui/joy/Input'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Checkbox from '@mui/joy/Checkbox'
import Textarea from '@mui/joy/Textarea'
import Button from '@mui/joy/Button'


export default function FormInstance({formInstance, projectId}) {
    const{baseform} =useProject();
    const [answers, setAnswers] = useState({});
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    if (formInstance?.data) {
      const initial = {};
      formInstance.data.forEach(field => {
        initial[field.fieldId] = { value: field.value, notes: field.notes || '' };
      });
      setAnswers(initial);
    }
  }, [formInstance, baseform]);

  const renderField = (field) => {
    const answer = answers[field._id] || { value: '', notes: '' };
    const isDisabled = field.enabled === false;

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            minRows={3}
            value={answer.value}
            onChange={e => handleChange(field._id, e.target.value)}
            placeholder="Texto..."
            disabled={isDisabled}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={answer.value}
            onChange={e => handleChange(field._id, e.target.value)}
            placeholder="Número..."
            disabled={isDisabled}
          />
        );
      case 'select':
        return (
          <Select
            value={answer.value || ''}
            onChange={(_, val) => handleChange(field._id, val)}
            placeholder="Selecciona una opción"
            disabled={isDisabled}
          >
            {field.options?.map((opt, i) => (
              <Option key={i} value={opt}>{opt}</Option>
            ))}
          </Select>
        );
      case 'multiselect':
        return (
          <Select
            multiple
            value={answer.value || []}
            onChange={(_, val) => handleChange(field._id, val)}
            placeholder="Selecciona opciones"
            disabled={isDisabled}
          >
            {field.options?.map((opt, i) => (
              <Option key={i} value={opt}>{opt}</Option>
            ))}
          </Select>
        );
      case 'boolean':
        return (
          <Checkbox
            checked={!!answer.value}
            onChange={e => handleChange(field._id, e.target.checked)}
            label="Sí / No"
            disabled={isDisabled}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={answer.value || ''}
            onChange={e => handleChange(field._id, e.target.value)}
            disabled={isDisabled}
          />
        );
      default:
        return null;
    }
  };

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], value }
    }));
  };

   const handleNotesChange = (fieldId, notes) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], notes }
    }));
  };


    const handleSave = async () => {
      const data = baseform.fields.map(field => ({
        fieldId: field._id,
        value: answers[field._id]?.value ?? '',
        notes: answers[field._id]?.notes ?? ''
      }));

      try {
        await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/instancia/project/${projectId}/instance/edit/${formInstance._id.toString()}`,
          { data }, {withCredentials:true}
        );
        setToast({ open: true, message: 'Respuestas guardadas', type: 'success' });
      } catch (error) {
        setToast({ open: true, message: 'Error al guardar', type: 'error' });
      }
    };

    const handleSaveAndComplete = async () => {
      const data = baseform.fields.map(field => ({
        fieldId: field._id,
        value: answers[field._id]?.value ?? '',
        notes: answers[field._id]?.notes ?? ''
      }));

      try {
        await axios.patch(`${import.meta.env.VITE_APP_SERVER_URL}/instancia/project/${projectId}/instance/edit/${formInstance._id.toString()}?status=completado`,
          { data }, {withCredentials:true}
        );
        setToast({ open: true, message: 'Respuestas guardadas y formulario completado', type: 'success' });
      } catch (error) {
        setToast({ open: true, message: 'Error al guardar', type: 'error' });
      }
    };



  return (
    <Box component='main' >
      <InfoToast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
      <Stack direction='row' spacing={5}>
        <Typography level='h3' mb={2}>Formulario de extracción</Typography>
        <Button
          size='sm'
          sx={{
            mt: 2,
            backgroundColor:'#538e56ff',
                      color:'#fff',
                      '&:hover':{backgroundColor:"green"}
          }}
          onClick={handleSaveAndComplete}
        >
          Guardar y marcar como completado
        </Button>
        <Button size='sm' sx={{ mt: 2,  backgroundColor:'#538e56ff',
                      color:'#fff',
                      '&:hover':{backgroundColor:"green"} }} onClick={handleSave}>Guardar cambios</Button>
      </Stack>
      <Stack spacing={2}>
        {baseform.fields?.map((field) => {
          const isDisabled = field.enabled === false;
          return (
            <Box key={field._id} sx={{ mb: 2 }}>
              <Typography level='body-md' fontWeight="bold">{field.label}</Typography>
              {renderField(field)}
              <Typography level="body-xs" color="neutral">{field.helpText}</Typography>
              {isDisabled && (
                <Typography level="body-xs" color="danger">
                  Este campo está deshabilitado y no puede ser editado.
                </Typography>
              )}
              <Textarea
                minRows={1}
                value={answers[field._id]?.notes || ''}
                onChange={e => handleNotesChange(field._id, e.target.value)}
                placeholder="Notas (opcional)..."
                sx={{ mt: 1 }}
                disabled={isDisabled}
              />
            </Box>
          );
        })}
      </Stack>
    </Box>  
  )
}

 