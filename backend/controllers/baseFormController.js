import BaseForm from '../models/baseForm.js';

// CREAR FORMULARIO BASE
export const createBaseForm = async (req, res) => {
    const { projectId } = req.params;
    const { fields } = req.body;

    try {
        const newBaseForm = new BaseForm({
            projectId,
            fields,
        });

        await newBaseForm.save();
        res.status(201).json(newBaseForm);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el formulario base', error });
    }
};

// BUSCAR FORMULARIO BASE POR ID
export const getBaseFormById = async (req, res) => {
    const baseForm = req.baseForm || await BaseForm.findById(req.params.bformId);
    if (!baseForm) {
        return res.status(404).json({ message: 'Formulario base no encontrado' });
    }
    res.status(200).json(baseForm);
};

// ACTUALIZAR FORMULARIO BASE
export const updateBaseForm = async (req, res) => {
    const baseForm = req.baseForm;
    const userId = req.session.userId;
    const { fields } = req.body;

    try {
        if (fields) baseForm.fields = fields;
        baseForm.updatedBy = userId;
        baseForm.version += 1;
        baseForm.status = "free";
        baseForm.isActive = true;
        await baseForm.save();
        res.status(200).json(baseForm);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el formulario base', error });
    }
};

// AGREGAR COMENTARIO
export const comments = async (req, res) => {
    const baseForm = req.baseForm || await BaseForm.findById(req.params.bformId);
    const userId = req.session.userId;
    const { comment } = req.body;

    try {
        if (!baseForm) {
            return res.status(404).json({ message: 'Formulario base no encontrado' });
        }

        baseForm.comments.push({
            userId,
            comment,
            createdAt: new Date(),
            status: 'pendiente',
        });

        await baseForm.save();
        res.status(200).json(baseForm);
    } catch (error) {
        res.status(500).json({ message: 'Erroral añadir comentario', error });
    }
};