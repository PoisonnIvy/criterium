import BaseForm from '../models/baseForm.js';
import Project from '../models/project.js';
import FormInstance from '../models/formInstance.js';
import Article from '../models/article.js';
import Assignment from '../models/assignment.js';


/* middleware que verifica si el usuario es 
parte de un proyecto y su rol dentro del mismo

carga en el req lo siguiente:
- req.project: el proyecto al que esta accediendo el usuario
- req.userRole: el rol del usuario dentro del proyecto
- req.baseForm: el formulario base 
- req.instance: la instancia del formulario 
- req.article: el artículo si se está accediendo a uno
- req.assignment: la asignacion del articulo

***todo en base al id que se pasa en la url, asi que hay que 
fijar bien los nombres de los ids que se pasan por la url***
*/

export const isMember = (roleList = []) => async (req, res, next) => {
    const userId = req.session.userId;
    const{ projectId,baseFormId, instanceId, articleId, assignmentId } = req.params;

    if(!projectId) return res.status(417).json({ message: 'Falta el id del proyecto' });
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });
    
    const userRole = project.getUserRole(userId);
    
    if (!userRole) {
        return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }
    if (roleList.length && !roleList.includes(userRole)) {
        return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    req.project = project;
    req.userRole= userRole;

    if(instanceId){
        const instance= await FormInstance.findById(instanceId);
        if(!instance) return res.status(404).json({message:'Instancia no encontrada'});
        if(instance.projectId.toString() !== projectId) return res.status(403).json({message: 'Referencia de proyecto erronea'});
        req.instance = instance;
    }

    if (baseFormId) {
        const baseForm = await BaseForm.findById(baseFormId);
        if (!baseForm) return res.status(404).json({ message: 'Formulario base no encontrado' });
        if (baseForm.projectId.toString() !== projectId) return res.status(403).json({ message: 'Referencia de proyecto erronea' });
        if (baseForm.status === 'editing' || !baseForm.isActive) return res.status(423).json({ message: 'El formulario base está siendo editado por otro usuario' });
        req.baseForm = baseForm;

    }

    if(articleId){
        const article = await Article.findById(articleId);
        if(!article) return res.status(404).json({message:'Articulo no encontrado'});
        if(article.projectId.toString() !== projectId) return res.status(403).json({message:'Referencia de proyecto erronea'});
        req.article = article;

    }
    if(assignmentId){
        const assignment = await Assignment.findById(assignmentId);
        if(!assignment) return res.status(404).json({message:'Tarea no encontrada'});
        if(assignment.projectId.toString() !== projectId) return res.status(403).json({message:'Referencia de proyecto erronea'});
        req.assignment = assignment;
    }

    return next();
};



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
        if (!['leader', 'editor'].includes(userRole)) {
            return res.status(403).json({ message: 'No tienes permisos para editar este formulario base' });
        }
        if (!baseForm.isActive || baseForm.status === "editing") {
            return res.status(423).json({ message: 'El formulario está siendo editado por otro usuario' });
        }

        baseForm.status = "editing";
        baseForm.isActive = false;
        baseForm.updatedBy = userId;
        await baseForm.save();

        req.baseForm = baseForm;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al bloquear el formulario base', error });
    }
};

export const instanceAccess = async (req, res, next) => {
    const userId = req.session.userId;
    const assignment = req.assignment;
    const instance = await FormInstance.findOne({ projectId: assignment.projectId, assignmentId: assignment._id });

    if(instance.assignmentId.toString() !== assignment._id.toString()) {
        return res.status(403).json({ message: 'Referencia de instancia erronea con respecto a la referecia de asignación' });
    }else{
        if(assignment.reviewerId.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a esta instancia' });
        }
    }
    const article = await Article.findById(assignment.articleId);
    if (article._id.toString() !== instance.articleId.toString()) {
        return res.status(404).json({ message: 'Articulo no encontrado o no pertenece a esta instancia' });
    }
    req.article = article;
    req.instance = instance;

    return next();
}

export const isReviewer = async (req, res, next) => {
    const userId = req.session.userId;
    const assignment = req.assignment;

    if (!assignment) {
        return res.status(400).json({ message: 'Falta la id de la asignación' });
    }

    if (assignment.reviewerId.toString() !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar esta asignación.' });
    }
    next();
}