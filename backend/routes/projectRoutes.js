import {Router} from 'express';  
import { 
    getProjects, 
    updateProject, 
    getProjectById, 
    createProject, 
    leaveProject,
    changeProjectStatus,
    removeMember,
    inviteMember,
    acceptInvite,
    changeRole,
} from '../controllers/projectController.js';
import { isMember, projectAccess, } from '../middleware/hasProjectAccess.js';
import { requireAuth } from '../middleware/authMiddleware.js';


const router = Router();


router.use(requireAuth);

router.post('/new', createProject);
router.get('/user', getProjects); //todos los projectos de 1 usuario
router.get('/:projectId', isMember(),getProjectById); // 1 projecto por usuario con id del projecto
router.patch('/edit/:projectId', isMember(['investigador principal','editor']),projectAccess, updateProject); // id del proyecto, id usuario por session
router.patch('/change/:projectId', isMember(['investigador principal']), changeProjectStatus); //para deshabilitar un proyecto, se le pasa el id del proyecto y el status en la query

//rutas para admiistrar usuarios,roles, añadir, eliminar
router.delete('/leave/:projectId',isMember(['colaborador', 'editor']), projectAccess, leaveProject); //para dejar un proyecto, se le pasa el id del proyecto
router.patch('/member/:projectId/:memberId', isMember(['investigador principal','editor']), projectAccess, removeMember) // eliminar
router.patch('/member/:projectId/:memberId/role', isMember(['investigador principal','editor']), projectAccess, changeRole) // cambiar rol de miembro, se le pasa el id del proyecto y el id del miembro
router.post('/invite/:projectId', isMember(['investigador principal','editor']), projectAccess, inviteMember) // envir invitacion
router.post('/accept/:token', acceptInvite) // aceptar invitación


export default router;