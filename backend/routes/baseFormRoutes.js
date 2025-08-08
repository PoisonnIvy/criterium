import {Router} from 'express';  
import { requireAuth } from '../middleware/authMiddleware.js';
import  { 
    createBaseForm, 
    updateBaseForm, 
    getProjectBaseForm, 
    comments,
    updateComments,
    setEditingStatus,
    releaseEditingStatus,
    exportFieldsAsJson,
    importFieldsFromJson
} from '../controllers/baseFormController.js';
import { isMember, validateToken, projectAccess } from '../middleware/hasProjectAccess.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/tmp/' });


const router = Router();
router.use(requireAuth)

router.post('/project/:projectId/bform/create', isMember(['investigador principal']), projectAccess, createBaseForm); //id DEL PROYECTO
router.patch('/project/:projectId/bform/update/:baseFormId',isMember(['investigador principal','editor']),projectAccess, validateToken, updateBaseForm); //id del formulario
router.get('/project/:projectId/bform/get',isMember(), getProjectBaseForm); //id del formulario

router.patch('/project/:projectId/bform/editing/:baseFormId',isMember(['investigador principal','editor']),projectAccess, setEditingStatus )
router.patch('/project/:projectId/bform/:baseFormId/cancel',isMember(['investigador principal','editor']),projectAccess, validateToken, releaseEditingStatus)
router.put('/project/:projectId/bform/comment/:baseFormId',isMember(),projectAccess, comments) //id del formulario. ruta tipo upsert
router.patch('/project/:projectId/comments/update/:commentId', isMember(['investigador principal','editor']), projectAccess, updateComments)

// Exportar fields como JSON
router.get('/project/:projectId/bform/export-fields', isMember(), projectAccess, exportFieldsAsJson);
// Importar fields desde JSON y crear baseForm
router.post('/project/:projectId/bform/import-fields', isMember(['investigador principal']), projectAccess, upload.single('file'), importFieldsFromJson);

export default router;