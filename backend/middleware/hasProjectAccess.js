import BaseForm from '../models/baseForm.js';
import Project from '../models/project.js';
import FormInstance from '../models/formInstance.js';
import Article from '../models/article.js';
import Assignment from '../models/assignment.js';
import { baseformTokenCache } from '../index.js';
/* middleware que verifica si el usuario es 
parte de un proyecto y su rol dentro del mismo

carga en el req lo siguiente:
- req.project: el proyecto al que esta accediendo el usuario
- req.userRole: el rol del usuario dentro del proyecto
- req.baseForm: el formulario base 
- req.instance: la instancia del formulario 
- req.article: el artículo si se está accediendo a uno
- req.assignment: la asignacion del articulo

***esto es en base al id que se pasa en la url, asi que hay que 
fijar bien los nombres de los ids que se pasan por la url***
*/

export const isMember = (roleList = []) => async (req, res, next) => {
    const userId = req.session.userId;
    const{ projectId,baseFormId, instanceId, articleId, assignmentId } = req.params;


    if(!projectId || projectId ==null || projectId == undefined) return res.status(417).json({ message: 'Falta el id del proyecto' });
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
        if (instance && instance.assignmentId) {
            const assignment = await Assignment.findById(instance.assignmentId);
            if (assignment) req.assignment = assignment;
        }
        req.instance = instance;
    }

    if (baseFormId) {
        const baseForm = await BaseForm.findById(baseFormId);
        if (!baseForm) return res.status(404).json({ message: 'Formulario base no encontrado' });
        if (baseForm.projectId.toString() !== projectId) return res.status(403).json({ message: 'Referencia de proyecto erronea' });
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

    next();
};


export const projectAccess = (req,res,next) =>{
    const project = req.project;

    if(['completado','deshabilitado'].includes(project.status)) {
        return res.status(403).json({message:'Este proyecto no se encuentra activo'});
    }
    next();
}

/* Valida el token para editar el formulario base. se le pasa el token por query y se retorna el estado*/


export const validateToken = (req, res, next) => {
    const baseForm = req.baseForm;
    const { token } = req.query;
    
    const cachedCode = baseformTokenCache.get(baseForm._id.toString());
    
    if (!cachedCode) {
        return res.status(400).json({ message: "El token expiró o es inválido" });
    }
    
    if (cachedCode !== token) {
        return res.status(400).json({ message: "Token de modificación inválido" });
    }
    
    next();
};


/* valida el acceso a una determinada instancia o asignación para poder editar su información*/

export const instanceAccess = async (req, res, next) => {
    const userId = req.session.userId;
    const project = req.project
    const assignment = req.assignment
    const instance =  await FormInstance.findOne({ projectId: project._id, assignmentId: assignment._id })
                                        .populate({ path: 'articleId', select: 'title pdfPath OA_URL doiUrl tags' });

    if(instance.assignmentId.toString() !== assignment._id.toString()) {
        return res.status(403).json({ message: 'Referencia de instancia erronea con respecto a la referecia de asignación' });
    }else{
        if(assignment.reviewerId.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a esta instancia' });
        }
    }
    const article = await Article.findById(assignment.articleId);
    if (article._id.toString() !== instance.articleId._id.toString()) {
        return res.status(404).json({ message: 'Articulo no encontrado o no pertenece a esta instancia' });
    }
    req.article = article;
    req.instance = instance;


    return next();
}


// valida si es el revisor asignado al artículo para poder quitarse la asignacion

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