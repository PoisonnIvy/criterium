import {Router} from 'express';  
import { getProjects, updateProject, getProjectById, createProject, leaveProject} from '../controllers/projectController.js';
import { isMember } from '../middleware/hasProjectAccess.js';
import { requireAuth } from '../middleware/AuthMiddleware.js';


const router = Router();

// todos los endpoints requieren de una sesion activa
router.post('/project/new', requireAuth, createProject);
router.get('/projects/user', getProjects); //todos los projectos de 1 usuario
router.get('/project/:projectId', isMember(),getProjectById); // 1 projecto por usuario con id del projecto
router.put('/projects/:projectId', isMember(['leader','editor']),updateProject); // id del proyecto, id usuario por session
router.delete('/project/leave/:projectId',isMember(),leaveProject); //para dejar un proyecto, se le pasa el id del proyecto


export default router;