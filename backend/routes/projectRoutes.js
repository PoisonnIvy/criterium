import {Router} from 'express';  
import { 
    getProjects, 
    updateProject, 
    getProjectById, 
    createProject, 
    leaveProject
} from '../controllers/projectController.js';
import { isMember } from '../middleware/hasProjectAccess.js';
import { requireAuth } from '../middleware/AuthMiddleware.js';


const router = Router();
router.use(requireAuth);

router.post('/new', createProject);
router.get('/user', getProjects); //todos los projectos de 1 usuario
router.get('/:projectId', isMember(),getProjectById); // 1 projecto por usuario con id del projecto
router.put('/edit/:projectId', isMember(['leader','editor']),updateProject); // id del proyecto, id usuario por session
router.delete('/leave/:projectId',isMember(),leaveProject); //para dejar un proyecto, se le pasa el id del proyecto


export default router;