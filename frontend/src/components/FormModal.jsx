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


export default function BasicFormModal({open, onClose, title, description, fields, values, onChange, onSubmit}) {
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
                  <Textarea
                    name={field.name}
                    value={values[field.name] || ""}
                    onChange={onChange}
                    required={field.required}
                  />
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
                    onChange={e => onChange({ target: { name: field.name, value: e.target.checked } })}
                  />
                ) : (
                  <Input
                    name={field.name}
                    type={field.type}
                    value={values[field.name] || ""}
                    onChange={onChange}
                    required={field.required}
                  />
                )}
              </FormControl>
            ))} 
            <div className='buttonGroup'>
            <Button type="submit">Enviar</Button>
            <Button sx={{backgroundColor:'#a22c27', '&:hover': {
                        backgroundColor: '#8b1f1b'
                        }}}onClick={onClose}>Cancelar</Button>
            </div>
          </Stack>
         
        </form>
      </ModalDialog>
    </Modal>
  );
}
