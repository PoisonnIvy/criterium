import {Router} from 'express';  
import { requireAuth } from '../middleware/authMiddleware.js';
import  { 
    createBaseForm, 
    updateBaseForm, 
    getProjectBaseForm, 
    comments,
    updateComments,
    setEditingStatus,
    releaseEditingStatus
} from '../controllers/baseFormController.js';
import { isMember, validateToken, projectAccess } from '../middleware/hasProjectAccess.js';


const router = Router();
router.use(requireAuth)

router.post('/project/:projectId/bform/create', isMember(['investigador principal']), projectAccess, createBaseForm); //id DEL PROYECTO

router.patch('/project/:projectId/bform/editing/:baseFormId',isMember(['investigador principal','editor']),projectAccess, setEditingStatus )
router.patch('/project/:projectId/bform/:baseFormId/cancel',isMember(['investigador principal','editor']),projectAccess, validateToken, releaseEditingStatus)
router.patch('/project/:projectId/bform/update/:baseFormId',isMember(['investigador principal','editor']),projectAccess, validateToken, updateBaseForm); //id del formulario


router.get('/project/:projectId/bform/get',isMember(), getProjectBaseForm); //id del formulario
router.put('/project/:projectId/bform/comment/:baseFormId',isMember(),projectAccess, comments) //id del formulario. ruta tipo upsert
router.patch('/project/:projectId/comments/update/:commentId', isMember(['investigador principal','editor']), projectAccess, updateComments)
export default router;