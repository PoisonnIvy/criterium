import { promises as fs } from 'fs';
import path from 'path';

export default validatePDF = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        const filePath = req.file.path;
        

        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(500).json({ error: 'Error al acceder al archivo' });
        }


        const stats = await fs.stat(filePath);
        if (stats.size === 0) {
            await fs.unlink(filePath);
            return res.status(400).json({ error: 'El archivo está vacío' });
        }
        if (stats.size > 15 * 1024 * 1024) {
            await fs.unlink(filePath);
            return res.status(400).json({ error: 'El archivo es demasiado grande' });
        }

        req.fileInfo = {
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: stats.size,
            mimetype: req.file.mimetype
        };

        next();
    } catch (error) {
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo:', unlinkError);
            }
        }
        res.status(500).json({ error: 'Error al validar archivo' });
    }
};
