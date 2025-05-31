import  { createBaseForm, updateBaseForm } from '../controllers/baseFormController.js';
import {Router} from 'express';  

const router = Router();

router.post('/bf', createBaseForm);
router.put('/bf/:id', updateBaseForm);

export default router;