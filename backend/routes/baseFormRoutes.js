import {Router} from 'express';  
import { requireAuth } from '../middleware/AuthMiddleware.js';
import  { 
    createBaseForm, 
    updateBaseForm, 
    getProjectBaseForm, 
    comments,
    updateComments
} from '../controllers/baseFormController.js';
import { isMember, setEditingStatus } from '../middleware/hasProjectAccess.js';


const router = Router();
router.use(requireAuth)

router.post('/project/:projectId/bform/create', isMember(['leader']), createBaseForm); //id DEL PROYECTO
router.patch('/project/:projectId/bform/update/:bformId',isMember(['leader','editor']), setEditingStatus, updateBaseForm); //id del formulario
router.get('/project/:projectId/bform/get',isMember(), getProjectBaseForm); //id del formulario
router.put('/project/:projectId/bform/comment/:bformId',isMember(), comments) //id del formulario. ruta tipo upsert
router.patch('/project/:projectId/comments/update/:commentId', isMember(['leader','editor']), updateComments)
export default router;