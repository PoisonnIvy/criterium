import {Router} from 'express';  
import { requireAuth } from '../middleware/authMiddleware.js';
import { 
    addAssignment, 
    removeAssignment,
    getAllAssignments,
    updateAssignment
} from '../controllers/assignmentController.js';
import { isMember, isReviewer, projectAccess, } from '../middleware/hasProjectAccess.js';

const router = Router();
router.use(requireAuth);

router.get('/project/:projectId/assignment/all', isMember(), getAllAssignments );
router.patch('/project/:projectId/remove/assignment/:assignmentId', isMember(), projectAccess, isReviewer, removeAssignment);

router.post('/project/:projectId/new/:articleId', isMember(), projectAccess, addAssignment);

router.patch('/project/:projectId/update/:assignmentId', isMember(), projectAccess, updateAssignment);

router.patch('/project/:projectId/assignment/:assignmentId/revoke', isMember(['investigador principal','editor']), projectAccess, removeAssignment); 

export default router;