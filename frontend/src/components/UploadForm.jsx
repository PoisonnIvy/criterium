/* eslint-disable no-unused-vars */
import React, { useRef, useState } from 'react'
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import InfoToast from './InfoToast';
import axios from 'axios';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';

export default function UploadModal({ open, onClose, projectId, onSubmit }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedFields, setParsedFields] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' });
  const inputRef = useRef();

  if (!open) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.json')) {
      parseJsonFile(file);
    } else {
      setToast({ open: true, message: 'Solo se permiten archivos .json', type: 'warning' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      parseJsonFile(file);
    } else {
      setToast({ open: true, message: 'Solo se permiten archivos .json', type: 'warning' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);

  const parseJsonFile = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (!json || !Array.isArray(json.fields)) {
          setToast({ open: true, message: 'El archivo debe tener el formato: { fields: [...] }', type: 'warning' });
          setParsedFields(null);
          setSelectedFile(null);
          return;
        }
        setParsedFields(json.fields);
        console.log(json.fields);
        setSelectedFile(file);
      } catch (err) {
        setToast({ open: true, message: 'El archivo no es un JSON válido', type: 'error' });
        setParsedFields(null);
        setSelectedFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!parsedFields || !selectedFile) return;
    setLoading(true);
    onSubmit(parsedFields);
    setParsedFields(null);
    setSelectedFile(null);
    onClose();
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <Typography level="h4" sx={{ color: 'var(--color-terracotta)', mb: 2 }}>Subir plantilla de formulario</Typography>
        <Box
          sx={{
            minWidth: 250,
            minHeight: 120,
            border: dragOver ? '2px solid var(--color-aceptar)' : '2px dashed #bdbdbd',
            borderRadius: 8,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            bgcolor: dragOver ? '#d4edda' : '#fafafa',
            transition: 'border 0.2s, background 0.2s',
            mb: 2
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current.click()}
        >
          <input
            type="file"
            ref={inputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileChange}
          />
          <UploadFileIcon sx={{ fontSize: 48, color: 'var(--color-terracotta)', mb: 1 }} />
          <span>
            Tipo de archivo permitido: <br /><b>.json</b><br />
            {selectedFile && <Typography level="body-xs">{selectedFile.name}</Typography>}
          </span>
          {!selectedFile && (
            <Typography level="body-xs" color="neutral" sx={{ mt: 1 }}>
              Arrastra o haz click para subir
            </Typography>
          )}
        </Box>
        {parsedFields && (
          <Typography level="body-xs" color="success" sx={{ mb: 1 }}>
            Archivo listo para importar. {parsedFields.length} campos detectados.
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button color="danger" onClick={onClose}>Cerrar</Button>
          <Button
            variant="solid"
            color="success"
            disabled={!parsedFields || loading}
            loading={loading}
            onClick={handleSubmit}

          >
            Importar
          </Button>
        </Box>
        <ModalClose />
        <InfoToast
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, open: false })}
        />
      </ModalDialog>
    </Modal>
  );
}
