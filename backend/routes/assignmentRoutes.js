import { addAssignment, removeAssignment } from '../controllers/assignmentController.js';
import {Router} from 'express';  

const router = Router();

router.post('/ass', addAssignment);
router.put('/ass/:id', removeAssignment);

export default router;