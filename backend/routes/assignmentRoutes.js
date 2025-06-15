import {Router} from 'express';  
import { requireAuth } from '../middleware/AuthMiddleware.js';
import { 
    addAssignment, 
    removeAssignment,
    getAllAssignments,
    updateAssignment
} from '../controllers/assignmentController.js';
import { isMember, isReviewer } from '../middleware/hasProjectAccess.js';

const router = Router();
router.use(requireAuth);

router.post('/project/:projectId/new/:articleId', isMember(), addAssignment);
//ruta update solo para cambiar el estado, notas/comentarios o la prioridad. solo el revisor, edito y lider puede editar eso
router.patch('/project/:projectId/update/:assignmentId', isMember(), updateAssignment);

router.patch('/project/:projectId/remove/assignment/:assignmentId', isMember(), isReviewer, removeAssignment);

router.get('/project/:projectId/assignment/all', isMember(), getAllAssignments );

router.patch('/project/:projectId/assignment/:assignmentId/revoke', isMember(['leader','editor']), removeAssignment); //query:
export default router;