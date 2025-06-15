import { Router } from 'express';
import { requireAuth } from '../middleware/AuthMiddleware.js';
import { isMember, instanceAccess} from '../middleware/hasProjectAccess.js';
import {
    editFormInstance,
    getFormInstanceById,    
    getAllInstances
} from '../controllers/formInstanceController.js';

const router = Router();
router.use(requireAuth);

/*
1- Se pueden editar las instancias de formulario, y tambien actualizar su estado a completed
siempre que se pase el parametro status=completed en la query
2- Endpoint para obtener la instancia de formulario por id y siempre que el usuario sea el asignado
3- Endpoint para obtener todas las instancias de formulario de un proyecto
*/
router.patch('/project/:projectId/instance/edit/:instanceId', isMember(), instanceAccess, editFormInstance);
router.get('/project/:projectId/instance/:assignmentId', isMember(),instanceAccess, getFormInstanceById);
router.get('/project/:projectId/instances', isMember(), getAllInstances);


export default router;