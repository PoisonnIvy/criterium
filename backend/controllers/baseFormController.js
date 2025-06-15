import BaseForm from '../models/baseForm.js';

// CREAR FORMULARIO BASE
export const createBaseForm = async (req, res) => {
    const { projectId } = req.params;
    const { fields } = req.body;
    const userId = req.session.userId;

    try {
        const newBaseForm = new BaseForm({
            projectId,
            fields,
            updatedBy: userId,
        });

        await newBaseForm.save();
        res.status(201).json(newBaseForm);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el formulario base', error });
    }
};

// BUSCAR FORMULARIO BASE POR ID
export const getProjectBaseForm = async (req, res) => {
    const project = req.project;
    try {
        const baseform= await BaseForm.findOne({projectId:project._id});
        if(baseform) return res.status(200).json(baseform);
        res.status(404).json({message:'Formulario no encontrado'})
    } catch (error) {
        res.status(500).json({message:'Ha ocurrido un error al buscar el formulario'})
    }

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
        res.status(200).json({message:"Comentario agregado con éxito", comments:baseForm.comments});
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir comentario', error });
    }
};

export const updateComments = async (req,res) => {
    const commentId=req.params.commentId;
    const {status}=req.body;

    try {
        const comment = await BaseForm.findOne({"comments._id": commentId});
        if (!comment) {
            return res.status(404).json({ message: "Comentario no encontrado" });
        }
        if(!['pendiente', 'resuelto'].includes(status)) return res.status(400).json({message:'Estado no válido'});

        comment.comments.id(commentId).status=status;
        await comment.save();
        res.status(200).json({message:'Estado actualizado'})
    } catch (error) {
        return res.status(500).json({ message: "Ha ocurrido un error" });
    }
}