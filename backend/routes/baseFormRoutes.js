import {Router} from 'express';  
import  { createBaseForm, updateBaseForm, getBaseFormById, comments } from '../controllers/baseFormController.js';
import { isMember, setEditingStatus } from '../middleware/hasProjectAccess.js';

const router = Router();

router.post('/bform/create/:projectId', isMember(['leader']), createBaseForm); //id DEL PROYECTO
router.patch('/bform/update/:bformId',isMember(['leader','editor']), setEditingStatus, updateBaseForm); //id del formulario
router.get('/bform/status/:bformId',isMember(), getBaseFormById); //id del formulario
router.put('/bform/comment/:bformId',isMember(), comments) //id del formulario

export default router;