import Assignment from '../models/assignment.js';
import Article from '../models/article.js';
import BaseForm from '../models/baseForm.js';
import  {createFormInstance} from '../controllers/formInstanceController.js';


export const addAssignment = async (req, res) => {
    const { projectId, articleId } = req.params ;
    let { reviewerId} = req.body;
    const project = req.project;
    const article = req.article;
    const userId = req.session.userId;

    if(!reviewerId) reviewerId = userId;

    if (article.projectId.toString() !== projectId) return res.status(403).json({ message: 'Referencia de proyecto erronea' });
    
    const member= project.getUserRole(reviewerId);
    if (!member) return res.status(403).json({ message: 'El revisor asignado no pertenece al proyecto' });

    try {
            const baseform= await BaseForm.findOne({ projectId });
            if (!baseform) {
                return res.status(404).json({ message: 'Formulario base no encontrado' });
            }

            const data = baseform.fields.map(field => ({
                fieldId: field._id,
                value:"",
                notes: "",
                extractedBy: null
            }));
            const newAssignment = new Assignment({
                projectId,
                reviewerId,
                articleId,
                assignedBy : userId
            });
            const formInstance = await createFormInstance({
                projectId,
                articleId,
                baseFormId: baseform._id,
                assignmentId: newAssignment._id,
                data
            });
            if(!formInstance) {
                return res.status(500).json({ message: 'Error al crear la instancia de formulario, la asignación no se ha podido crear.' });
            }
            await newAssignment.save();
            res.status(200).json(newAssignment);

    } catch (error) {
        if(error.code === 11000) {
            return res.status(409).json({ message: 'Ya existe una asignación para este artículo.' });
        }
        res.status(500).json({ message: 'Ha ocurrido un error al intentar hacer la asignación.', error });
    }
}


export const removeAssignment = async (req, res) => {
    const assignment=req.assignment;
    const change  = req.query.change === 'true';
    const { reviewerId } = req.body;
    const userId = req.session.userId;
    const role= req.userRole

    

    try {
        if(reviewerId && change && (role ==='leader' || role === 'editor')) {
            const member= project.getUserRole(reviewerId);
            if (!member) return res.status(403).json({ message: 'El revisor asignado no pertenece al proyecto' });
            assignment.reviewerId = reviewerId;
            assignment.status = 'asignado';
        }else {
            assignment.reviewerId = null;
            assignment.status = 'no asignado';
        }

        assignment.assignedBy = userId;
        await assignment.save();
    } catch (error) {
        res.status(500).json({ message: 'Error al revocar la asignación', error });
    }
}

export const getAllAssignments = async (req, res) => {
    const { projectId } = req.params;
    const { status } = req.query;

    try {
        const filter={projectId};
        if(status) filter.status = status;
        const assignments = await Assignment.find(filter)
            .populate({ path: 'articleId', select: 'title' })
            .populate({ path: 'reviewerId', select: 'name email' })

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error });
    }
}

export const updateAssignment = async (req, res) => {
    const assignment = req.assignment;
    const { status, priority } = req.body;
    const userId=req.session.userId;
    const assignee = assignment.reviewerId;


    if(!(userId == assignee)){
        return res.status(403).json({message:'No tienes permiso para modificar esta asignación'});
    }

    if (!assignment) {
        return res.status(404).json({ message: 'Asignación no encontrada' });
    }

    if (status==='completado') {
        assignment.completedAt = Date.now()
        assignment.status = status;
    }else assignment.status = status;
        
    if (priority) assignment.priority = priority;

    try {
        const updatedAssignment = await assignment.save();
        res.status(200).json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la asignación', error });
    }
}
