import File from '../models/file.js';
import { promises as fs } from 'fs';
import { resolve } from 'path';

export async function uploadFile(req, res) {
    try {

        const file = new File({
            originalName: req.fileInfo.originalName,
            filename: req.fileInfo.filename,
            path: req.fileInfo.path,
            size: req.fileInfo.size,
            mimetype: req.fileInfo.mimetype,
            uploadedBy: req.user.id
        });

        await file.save();
        res.status(201).json({
            success: true,
            file: {
                id: file._id,
                originalName: file.originalName,
                size: file.size,
                uploadedAt: file.createdAt
            }
        });
    } catch (error) {
        if (req.fileInfo && req.fileInfo.path) {
            try {
                await fs.unlink(req.fileInfo.path);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo:', unlinkError);
            }
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getFile(req, res) {
    try {
        const file = await findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Verificar permisos (opcional)
        // if (file.uploadedBy.toString() !== req.user.id) {
        //     return res.status(403).json({ error: 'No autorizado' });
        // }

        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function downloadFile(req, res) {
    try {
        const file = await findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Verificar que el archivo existe físicamente
        try {
            await fs.access(file.path);
        } catch (error) {
            return res.status(404).json({ error: 'Archivo físico no encontrado' });
        }

        // Configurar headers para descarga
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimetype);
        
        // Enviar archivo
        res.sendFile(resolve(file.path));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteFile(req, res) {
    try {
        const file = await findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Eliminar archivo físico
        try {
            await fs.unlink(file.path);
        } catch (error) {
            console.error('Error al eliminar archivo físico:', error);
        }

        // Eliminar registro de BD
        await findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Archivo eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}