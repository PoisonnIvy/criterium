import FormInstance from '../models/formInstance.js';
import BaseForm from '../models/baseForm.js';
import User from '../models/user.js';
import { baseformTokenCache } from '../index.js';
import { sendCommentResolvedMail } from '../services/mailSender.js';

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
        return res.status(200).json(baseform);
    } catch (error) {
        res.status(500).json({message:'Ha ocurrido un error al buscar el formulario'})
    }

};

// ACTUALIZAR FORMULARIO BASE
export const updateBaseForm = async (req, res) => {
    const baseForm = req.baseForm;
    const userId = req.session.userId;
    const { fields } = req.body;
    const {token} = req.query
    const cachedToken = baseformTokenCache.get(baseForm._id.toString());
      if (!cachedToken) return res.status(400).json({ message: "El token expiró o es inválido" });
      if (cachedToken !== token) return res.status(400).json({ message: "token de modificación invalido" });

    try {
        if(baseForm.status !== 'editing' && baseForm.isActive == true) return res.status(412).json({msessage:'El formulario no se bloqueó correctamente antes de actualizarlo'})
        
        if (fields) baseForm.fields = fields;
        baseForm.updatedBy = userId;
        baseForm.version += 1;
        baseForm.status = "free";
        baseForm.isActive = true;
        await baseForm.save();
        baseformTokenCache.del(baseForm._id.toString());
        // --- ACTUALIZAR TODAS LAS INSTANCIAS ---
        const instances = await FormInstance.find({ projectId: baseForm.projectId, baseFormId: baseForm._id });
        for (const instance of instances) {
            const newData = baseForm.fields.map(field => {
                const prev = instance.data.find(d => d.fieldId.toString() === field._id.toString());
                return {
                    fieldId: field._id,
                    value: prev ? prev.value : "",
                    notes: prev ? prev.notes : "",
                    extractedBy: prev ? prev.extractedBy : null,
                    enabled: field.enabled !== undefined ? field.enabled : true
                };
            });
            instance.data = newData;
            instance.updateProgress();
            await instance.save();
        }

        res.status(200).json(baseForm);
    } catch (error) {
        res.status(500);
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
        if(!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Comentario no puede estar vacío' });
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
        const baseForm = await BaseForm.findOne({ "comments._id": commentId });
        if (!baseForm) {
            return res.status(404).json({ message: "Comentario no encontrado" });
        }
        if (!['pendiente', 'resuelto'].includes(status)) return res.status(400).json({ message: 'Estado no válido' });

        const comment = baseForm.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comentario no encontrado" });

        comment.status = status;
        await baseForm.save();

        if (status === 'resuelto') {
            const user = await User.findById(comment.userId);
            if (user && user.email) {
                await sendCommentResolvedMail({
                    to: user.email,
                    userName: user.name,
                    commentText: comment.comment,
                    projectName: baseForm.projectName || 'Proyecto'
                });
            }
        }

        res.status(200).json({ message: 'Estado actualizado', comment });
    } catch (error) {
        return res.status(500).json({ message: "Ha ocurrido un error" });
    }
}


/*  funcion para bloquear un formulario base para que
    solo un usuario pueda editarlo a la vez    */

export const setEditingStatus = async (req, res, next) => {
    const userId = req.session.userId;
    const baseForm = req.baseForm; 
    const userRole = req.userRole; 

    try {
        if (!baseForm) {
            return res.status(404).json({ message: 'Formulario base no encontrado' });
        }
        if (!['investigador principal', 'editor'].includes(userRole)) {
            return res.status(403).json({ message: 'No tienes permisos para editar este formulario base' });
        }
        
        if (baseForm.status === "editing" && baseForm.updatedBy.toString() !== userId.toString()) {
            
            res.status(200).json({ 
                message: 'El formulario está siendo editado por otro usuario',
                editedBy: baseForm.updatedBy,
                since: baseForm.updatedAt
            });
        }
        if (baseForm.status === "editing" && baseForm.updatedBy.toString() === userId.toString()) {
            const existingToken = baseformTokenCache.get(baseForm._id.toString());
            if (existingToken) {
                const ttl = baseformTokenCache.getTtl(baseForm._id.toString());
                const now = Date.now();
                const timeLeftSeconds = Math.max(0, Math.floor((ttl - now) / 1000));
                res.status(200).json({ 
                    token: existingToken,
                    expiresIn: timeLeftSeconds,
                    message: "Ya tienes este formulario bloqueado"
                });
            }
        }
        baseForm.status = "editing";
        baseForm.isActive = false;
        baseForm.updatedBy = userId;
        await baseForm.save();
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        baseformTokenCache.set(baseForm._id.toString(), token, 3600);
        res.status(200).json({ 
            token: token,
            expiresIn: 3600, //1 hora, 3600 segundos
            message: "Formulario bloqueado para edición"
        });
        
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Error al bloquear el formulario base', error });
    }
};


export const releaseEditingStatus = async (req, res) => {
    const baseForm = req.baseForm;
    const userId = req.session.userId;
    const { token } = req.query;
    
    try {
        const cachedCode = baseformTokenCache.get(baseForm._id.toString());

        if (cachedCode !== token && baseForm.updatedBy.toString() !== userId) {
            return res.status(403).json({ message: "No autorizado para liberar este bloqueo" });
        }

        baseForm.status = "free";
        baseForm.isActive = true;
        await baseForm.save();
        
        baseformTokenCache.del(baseForm._id.toString());
        
        res.status(200).json({ message: "Bloqueo liberado correctamente" });
    } catch (error) {
        res.status(500);
    }
};

// crear formulario a partir de fields de plantilla
export const importFieldsFromJson = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.session.userId;
    const { fields } = req.body;
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron campos válidos' });
    }

    try {
        const baseform = await BaseForm.findOne({ projectId });
        if (baseform) {
            return res.status(400).json({ message: 'Ya existe un formulario base para este proyecto' });
        }

            //validar formato
    const validTypes = ['textarea', 'number', 'select', 'multiselect', 'boolean', 'date'];
    for (const [i, field] of fields.entries()) {
        if (typeof field !== 'object' || field === null) {
            return res.status(400).json({ message: `El campo en la posición ${i} no es un objeto válido` });
        }
        if (field.label && typeof field.label !== 'string') {
            return res.status(400).json({ message: `El campo en la posición ${i} tiene un nombre inválido (label)` });
        }
        if (!field.type || typeof field.type !== 'string' || !validTypes.includes(field.type)) {
            return res.status(400).json({ message: `El campo '${field.label}' tiene un tipo inválido` });
        }
        if (field.enabled !== undefined && typeof field.enabled !== 'boolean') {
            return res.status(400).json({ message: `El campo '${field.label}' no está habilitado o deshabilitado correctamente (enabled)` });
        }
        if ((field.type === 'select' || field.type === 'multiselect') && (!Array.isArray(field.options) || field.options.some(opt => typeof opt !== 'string'))) {
            return res.status(400).json({ message: `El campo '${field.label}' debe tener un array de opciones de texto` });
        }
        if (field.helpText && typeof field.helpText !== 'string') {
            return res.status(400).json({ message: `El campo '${field.label}' tiene un helpText inválido` });
        }
    }

        const newBaseForm = new BaseForm({
            projectId,
            fields,
            updatedBy: userId,
        });

        await newBaseForm.save();
        res.status(201).json(newBaseForm);
    } catch (error) {
        res.status(500).json({ message: 'Error al importar campos', error });
    }
};