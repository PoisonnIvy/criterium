import BaseForm from '../models/baseForm.js';
import Project from '../models/Project.js';

/* middleware que verifica si el usuario es 
parte de un proyecto y su rol dentro del mismo

carga en el req lo siguiente:
- req.project: el proyecto al que pertenece el usuario
- req.userRole: el rol del usuario dentro del proyecto
- req.baseForm: el formulario base si se está accediendo a uno

***todo en base al id que se pasa en la url, asi que hay que 
fijar bien los nombres de los ids que sep pasan por la url***
*/

export const isMember = (roleList = []) => async (req, res, next) => {
    const userId = req.session.userId;
    let projectId = req.params.projectId;
    let baseFormId = req.params.bformId;
     
    // anotar cualquier otro que necesite confirmar roles

    if (!projectId && baseFormId) {
        const baseForm = await BaseForm.findById(baseFormId);
        if (!baseForm) return res.status(404).json({ message: 'Formulario base no encontrado' });
        projectId = baseForm.projectId;
        req.baseForm = baseForm;
    }

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
    req.userRole = userRole;
    next();
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

