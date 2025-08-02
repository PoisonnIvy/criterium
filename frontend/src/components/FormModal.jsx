import * as React from 'react';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import Textarea from '@mui/joy/Textarea';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Switch from '@mui/joy/Switch';
import FormHelperText from '@mui/joy/FormHelperText';


export default function BasicFormModal({open, onClose, title, description, fields, values, onChange, onSubmit}) {
  const disabled = fields.some(field => 
  (field.required && !values[field.name]) ||
  (field.required && field.min && values[field.name] && values[field.name].length < field.min)
);
  return (
   <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{overflow: 'auto', maxHeight: '90vh' }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{description}</DialogContent>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            {fields.map(field => (
              <FormControl key={field.name}>
                <FormLabel>{field.label}</FormLabel>
                {field.type === 'textarea' ? (
                  <>
                  <Textarea
                    name={field.name}
                    value={values[field.name] || ""}
                    onChange={onChange}
                    required={field.required}
                    error={field.required && field.min && values[field.name] && values[field.name].length < field.min}
                    minRows={3}
                    
                  /> 
                  {field.required && field.min && values[field.name] && values[field.name].length < field.min &&
                  <FormHelperText>
                    {field.required && field.min && values[field.name] && values[field.name].length < field.min
                      ? `Mínimo ${field.min} caracteres requeridos`
                      : null}
                  </FormHelperText>}
                  </>
                ) : field.type === 'select' ? (
                  <Select
                    name={field.name}
                    value={values[field.name] || ""}
                    onChange={(_, value) => onChange({ target: { name: field.name, value } })}
                    required={field.required}
                  >
                    {(field.options || []).map(opt => (
                      <Option key={opt} value={opt}>{opt}</Option>
                    ))}
                  </Select>
                ) : field.type === 'checkbox' ? (
                  <Switch
                    checked={!!values[field.name]}
                    color={values[field.name] ? 'success' : 'neutral'}
                    onChange={e => onChange({ target: { name: field.name, value: e.target.checked } })}
                  />
                ) : (
                  <>
                  <Input
                    name={field.name}
                    type={field.type}
                    value={values[field.name] || ""}
                    onChange={onChange}
                    required={field.required}
                    error={field.required && field.min && values[field.name] && values[field.name].length < field.min}
                    minLength={field.min? field.min : undefined}
                  />
                  {field.required && field.min && values[field.name] && values[field.name].length < field.min && <FormHelperText>
                    {field.required && field.min && values[field.name] && values[field.name].length < field.min
                      ? `Mínimo ${field.min} caracteres requeridos`
                      : null}
                  </FormHelperText>}
                  </>
                )}
              </FormControl>
            ))} 
            <div className='buttonGroup'>
            <Button type="submit" color='success' disabled={disabled}>Enviar</Button>
            <Button color='danger' onClick={onClose}>Cancelar</Button>
            </div>
          </Stack>
         
        </form>
      </ModalDialog>
    </Modal>
  );
}
